import { makeApplicationNoOpTxnFromObject, mnemonicToSecretKey, signTransaction } from "algosdk";
import { routerApp } from "./constants/constants.js";
import { algoD } from "./adapters/algoD.js";

const makePoolOptIn = async (asset: number): Promise<void> => {
  const account = mnemonicToSecretKey(process.env.Mnemo!);
  const suggestedParams = await algoD.getTransactionParams().do();

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
  await algoD.sendRawTransaction(signTransaction(optIn, account.sk).blob).do();
  console.log(`Router successfully opted-in asset n° ${asset}`);
};
export default makePoolOptIn;

