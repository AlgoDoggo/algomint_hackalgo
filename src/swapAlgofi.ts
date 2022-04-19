import {
  assignGroupID,
  encodeUint64,
  getApplicationAddress,
  makeApplicationNoOpTxnFromObject,
  makeAssetTransferTxnWithSuggestedParamsFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
  mnemonicToSecretKey,
  signTransaction,
  Transaction,
  waitForConfirmation,
} from "algosdk";
import { algoD } from "./adapters/algoD.js";
import { algofi_managerID_dex } from "./constants/constants.js";
import { SwapAlgoPact } from "./types/types.js";

const enc = new TextEncoder();

const swapAlgofi = async ({
  assetIn,
  amount,
  app,
  suggestedParams,
  assetOut,
  minAmountOut,
  mnemo,
}: SwapAlgoPact): Promise<void> => {
  const account = mnemonicToSecretKey(mnemo);
  let tx0: Transaction;
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

  const tx1 = makeApplicationNoOpTxnFromObject({
    // swap exact for
    suggestedParams: {
      ...suggestedParams,
      fee: suggestedParams.fee * 2, //(fee is 5x for nanoswap 2x for regular swap)
    },
    from: account.addr,
    appIndex: app,
    //"sef" for swap exact for, second arg is minimum amount to receive
    appArgs: [enc.encode("sef"), encodeUint64(minAmountOut)],
    foreignAssets: [assetOut],
    foreignApps: [algofi_managerID_dex],
  });

  const transactions = [tx0, tx1];
  assignGroupID(transactions);
  const signedTxs = transactions.map((t) => signTransaction(t, account.sk));
  const txId = signedTxs[1].txID;
  await algoD.sendRawTransaction(signedTxs.map((t) => t.blob)).do();
  const transactionResponse = await waitForConfirmation(algoD, txId, 5);
  const innerTX = transactionResponse["inner-txns"].map((t) => t.txn);
  const { aamt: amountOut, amt: algoOut, xaid } = innerTX[0]?.txn;
  console.log(
    `Swapped ${amount} ${assetIn === 0 ? "microAlgos" : "of your asset"} for ${amountOut ?? algoOut} ${
      xaid ? `token n°${xaid}` : "microAlgos"
    } on Algofi`
  );
};
export default swapAlgofi;
