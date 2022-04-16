import {
  assignGroupID,
  LogicSigAccount,
  makeApplicationNoOpTxnFromObject,
  makeAssetTransferTxnWithSuggestedParamsFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
  mnemonicToSecretKey,
  signLogicSigTransactionObject,
  waitForConfirmation,
} from "algosdk";
import { setupClient } from "../adapters/algoD.js";
import { tinySig, tinyValidatorApp } from "../constants/constants.js";

const enc = new TextEncoder();

export const swapTinyman = async ({ assetIn, amount, suggestedParams, tinypool, assetOut, tmpool, minAmountOut }) => {
  const account = mnemonicToSecretKey(process.env.Mnemo!);
  let algodClient = await setupClient();

  const lsig = new LogicSigAccount(new Uint8Array(Buffer.from(tinySig, "base64")));

  //fee
  const tx0 = makePaymentTxnWithSuggestedParamsFromObject({
    suggestedParams,
    from: account.addr,
    to: tinypool,
    amount: 2000,
  });

  const tx1 = makeApplicationNoOpTxnFromObject({
    suggestedParams,
    from: tinypool,
    appIndex: tinyValidatorApp,
    appArgs: [enc.encode("swap"), enc.encode("fi")],
    accounts: [account.addr],
    foreignAssets: [assetIn, assetOut, tmpool],
  });

  let tx2;
  if (assetIn === 0) {
    tx2 = makePaymentTxnWithSuggestedParamsFromObject({
      suggestedParams,
      from: account.addr,
      to: tinypool,
      amount,
    });
  } else {
    tx2 = makeAssetTransferTxnWithSuggestedParamsFromObject({
      suggestedParams,
      from: account.addr,
      to: tinypool,
      assetIndex: assetIn,
      amount,
    });
  }

  let tx3;
  if (assetOut === 0) {
    tx3 = makePaymentTxnWithSuggestedParamsFromObject({
      suggestedParams,
      from: tinypool,
      to: account.addr,
      amount: minAmountOut,
    });
  } else {
    tx3 = makeAssetTransferTxnWithSuggestedParamsFromObject({
      suggestedParams,
      from: tinypool,
      to: account.addr,
      assetIndex: assetOut,
      amount: minAmountOut,
    });
  }

  const transactions = [tx0, tx1, tx2, tx3];
  assignGroupID(transactions);
  const t0 = tx0.signTxn(account.sk);
  const t1 = signLogicSigTransactionObject(tx1, lsig);
  const t2 = tx2.signTxn(account.sk);
  const t3 = signLogicSigTransactionObject(tx3, lsig);
  await algodClient.sendRawTransaction([t0, t1.blob, t2, t3.blob]).do();
  const transactionResponse = await waitForConfirmation(algodClient, t3.txID, 5);
  const { aamt: amountOut, amt: algoOut, xaid } = transactionResponse?.txn?.txn;
  console.log(`Swapped ${amount} of your asset for ${amountOut ?? algoOut} ${xaid ? `token n°${xaid}` : "Algos"}`);
};
export default swapTinyman;
