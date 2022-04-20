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
import { SwapAlgoPact } from "./types/types.js";
import { sortAssets } from "./utils/sortAssets.js";

const enc = new TextEncoder();

const swapPactfi = async ({
  assetIn,
  amount,
  app,
  suggestedParams,
  assetOut,
  minAmountOut,
  mnemo,
}: SwapAlgoPact): Promise<void> => {
  const account = mnemonicToSecretKey(mnemo);
  const assets = sortAssets([assetIn, assetOut]);

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
    suggestedParams: {
      ...suggestedParams,
      fee: suggestedParams.fee * 2,
    },
    from: account.addr,
    appIndex: app,
    appArgs: [enc.encode("SWAP"), encodeUint64(minAmountOut)], // second arg is minimum amount out
    foreignAssets: [assets[0], assets[1]],
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
    `Swapped ${amount} ${assetIn === 0 ? "microAlgos" : `of asset n° ${assetIn}`} for ${amountOut ?? algoOut} ${
      xaid ? `token n°${xaid}` : "microAlgos"
    } on Pactfi`
  );
};
export default swapPactfi;
