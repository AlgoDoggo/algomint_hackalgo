import { algoD } from "../src/adapters/algoD.js";
import fs from "fs";
import {
  assignGroupID,
  getApplicationAddress,
  makeApplicationCreateTxnFromObject,
  makeApplicationNoOpTxnFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
  mnemonicToSecretKey,
  OnApplicationComplete,
  signTransaction,
  waitForConfirmation,
} from "algosdk";
import dotenv from "dotenv";
import { appTeal } from "../contracts/appTeal.js";
import { USDC } from "../src/constants/constants.js";
dotenv.config();

const createApp = async () => {
  const account = mnemonicToSecretKey(process.env.Mnemo!);
  const suggestedParams = await algoD.getTransactionParams().do();

  suggestedParams.flatFee = true;
  suggestedParams.fee = 1000;

  const compileApp = await algoD.compile(appTeal).do();

  const clearState = fs.readFileSync(new URL("../contracts/clearProg.teal", import.meta.url), "utf8");
  const compiledClearProg = await algoD.compile(clearState).do();

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

  const txSigned = tx.signTxn(account.sk);
  const { txId } = await algoD.sendRawTransaction(txSigned).do();
  const transactionResponse = await waitForConfirmation(algoD, txId, 5);
  const appId = transactionResponse["application-index"];
  console.log("Created router app: ", appId);

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
      fee: suggestedParams.fee * 2,
    },
    from: account.addr,
    appIndex: appId,
    foreignAssets: [USDC],
    appArgs: [new Uint8Array(Buffer.from("optIn", "utf-8"))],
  });
  const transactions = [bootstrap, appBootstrap];
  assignGroupID(transactions);
  const bootstrapSigned = transactions.map((t) => signTransaction(t, account.sk));
  await algoD.sendRawTransaction(bootstrapSigned.map((t) => t.blob)).do();
};

createApp().catch((error) => console.log(error.message));
