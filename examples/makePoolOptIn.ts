import { makeApplicationNoOpTxnFromObject, mnemonicToSecretKey, signTransaction } from "algosdk";
import { setupClient } from "../src/adapters/algoD.js";
import { routerApp } from "../src/constants/constants.js";
import dotenv from "dotenv";
dotenv.config();

const arg = Number(process.argv[2]);

const makePoolOptIn = async (asset: number): Promise<void> => {
  const account = mnemonicToSecretKey(process.env.Mnemo!);
  const algodClient = await setupClient();
  const suggestedParams = await algodClient.getTransactionParams().do();

  suggestedParams.flatFee = true;
  suggestedParams.fee = 1000;

  const optIn = makeApplicationNoOpTxnFromObject({
    suggestedParams: {
      ...suggestedParams,
      fee: suggestedParams.fee * 2,
    },
    from: account.addr,
    appIndex: routerApp,
    foreignAssets: [asset],
    appArgs: [new Uint8Array(Buffer.from("optIn", "utf-8"))],
  });
  await algodClient.sendRawTransaction(signTransaction(optIn, account.sk).blob).do();
  console.log("success");
};
export default makePoolOptIn;

makePoolOptIn(arg).catch((err) => console.error(err.message));
