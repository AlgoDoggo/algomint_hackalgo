import {
  assignGroupID,
  encodeUint64,
  getApplicationAddress,
  makeApplicationNoOpTxnFromObject,
  makeAssetTransferTxnWithSuggestedParamsFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
  mnemonicToSecretKey,
  signTransaction,
  waitForConfirmation,
} from "algosdk";
import dotenv from "dotenv";
import { setupClient } from "../adapters/algoD.js";
import { managerID_dex } from "../constants/constants.js";

dotenv.config();
const enc = new TextEncoder();

const swapAlgofi = async ({ assetIn, amount, app, suggestedParams, assetOut }) => {
  const account = mnemonicToSecretKey(process.env.Mnemo!);
  let algodClient = await setupClient();
  let tx0;
  if (assetIn === 0) {
    tx0 = makePaymentTxnWithSuggestedParamsFromObject({
      suggestedParams,
      from: account.addr,
      amount,
      to: getApplicationAddress(app),
    });
  } else {
    tx0 = makeAssetTransferTxnWithSuggestedParamsFromObject({
      suggestedParams,
      from: account.addr,
      to: getApplicationAddress(app),
      assetIndex: assetIn,
      amount,
    });
  }

  //"sef" for swap exact for
  //"sfe" for swap for exact, ie with a redeemTX at the end
  //"rsr" for swap for exact, ie with a redeemTX at the end
  const argsSef = [enc.encode("sef"), encodeUint64(0)]; // second arg is minimum amount to receive

  const tx1 = makeApplicationNoOpTxnFromObject({
    // swap exact for
    suggestedParams: {
      ...suggestedParams,
      fee: suggestedParams.fee * 2, //(fee is 5x for nanoswap 2x for regular swap)
    },
    from: account.addr,
    appIndex: app,
    appArgs: argsSef,
    foreignAssets: [assetOut],
    foreignApps: [managerID_dex],
  });

  const transactions = [tx0, tx1];
  assignGroupID(transactions);
  const signedTxs = transactions.map((t) => signTransaction(t, account.sk));
  const txId = signedTxs[1].txID;
  await algodClient.sendRawTransaction(signedTxs.map((t) => t.blob)).do();
  const transactionResponse = await waitForConfirmation(algodClient, txId, 5);
  const innerTX = transactionResponse["inner-txns"].map((t) => t.txn);
  const { aamt: amountOut, amt: algoOut, xaid } = innerTX[0]?.txn;
  console.log(`Swapped ${amount} of your asset for ${amountOut ?? algoOut} ${xaid ? `token n°${xaid}` : "microAlgos"}`);
};
export default swapAlgofi;
