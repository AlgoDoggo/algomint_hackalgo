import { setupClient } from "../adapters/algoD.js";
import fs from "fs";
import {
  assignGroupID,
  getApplicationAddress,
  makeApplicationCreateTxnFromObject,
  makeApplicationNoOpTxnFromObject,
  makeAssetTransferTxnWithSuggestedParamsFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
  mnemonicToSecretKey,
  OnApplicationComplete,
  signTransaction,
  waitForConfirmation,
} from "algosdk";
import dotenv from "dotenv";
import { appTeal } from "../contracts/appTeal.js";
import { USDC } from "../constants/constants.js";
dotenv.config();

const createApp = async () => {
  const account = mnemonicToSecretKey(process.env.Mnemo!);
  const algodClient = await setupClient();
  const suggestedParams = await algodClient.getTransactionParams().do();

  suggestedParams.flatFee = true;
  suggestedParams.fee = 1000;

  const compileApp = await algodClient.compile(appTeal()).do();

  const clearState = fs.readFileSync(new URL("../contracts/clearProg.teal", import.meta.url), "utf8");
  const compiledClearProg = await algodClient.compile(clearState).do();

  const tx = makeApplicationCreateTxnFromObject({
    suggestedParams,
    from: account.addr,
    approvalProgram: new Uint8Array(Buffer.from(compileApp.result, "base64")),
    clearProgram: new Uint8Array(Buffer.from(compiledClearProg.result, "base64")),
    numGlobalByteSlices: 0,
    numGlobalInts: 0,
    numLocalByteSlices: 0,
    numLocalInts: 0,
    onComplete: OnApplicationComplete.NoOpOC,
  });

  let txSigned = tx.signTxn(account.sk);
  let { txId } = await algodClient.sendRawTransaction(txSigned).do();
  let transactionResponse = await waitForConfirmation(algodClient, txId, 5);
  const appId = transactionResponse["application-index"];
  console.log("Created metapool app: ", appId);

  // bootstrap it
  const bootstrap = makePaymentTxnWithSuggestedParamsFromObject({
    suggestedParams,
    from: account.addr,
    to: getApplicationAddress(appId),
    amount: 10 ** 6,
  });

  const appBootstrap = makeApplicationNoOpTxnFromObject({
    suggestedParams: {
      ...suggestedParams,
      fee: suggestedParams.fee * 4,
    },
    from: account.addr,
    appIndex: appId,
    foreignAssets: [USDC, 54215619, 77279142],
    appArgs: [new Uint8Array(Buffer.from("optIn", "utf-8"))],
  });
  const transactions = [bootstrap, appBootstrap];
  assignGroupID(transactions);
  let bootstrapSigned = transactions.map((t) => signTransaction(t, account.sk));
  await algodClient.sendRawTransaction(bootstrapSigned.map((t) => t.blob)).do();
};

createApp().catch((error) => console.log(error.message));
