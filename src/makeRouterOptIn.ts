import {
  assignGroupID,
  getApplicationAddress,
  makeApplicationNoOpTxnFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
  mnemonicToSecretKey,
  signTransaction,
} from "algosdk";
import { routerApp } from "./constants/constants.js";
import { algoD } from "./adapters/algoD.js";

const makeRouterOptIn = async (assets: number[], mnemo: string): Promise<void> => {
  try {
    const account = mnemonicToSecretKey(mnemo);
    const suggestedParams = await algoD.getTransactionParams().do();
    suggestedParams.flatFee = true;
    suggestedParams.fee = 1000;

    const minBalance = makePaymentTxnWithSuggestedParamsFromObject({
      suggestedParams,
      from: account.addr,
      to: getApplicationAddress(routerApp),
      amount: assets.length * 10 ** 5,
    });

    const optIn = makeApplicationNoOpTxnFromObject({
      suggestedParams: {
        ...suggestedParams,
        fee: suggestedParams.fee * (1 + assets.length),
      },
      from: account.addr,
      appIndex: routerApp,
      foreignAssets: assets,
      appArgs: [new Uint8Array(Buffer.from("optIn", "utf-8"))],
    });

    const transactions = [minBalance, optIn];
    assignGroupID(transactions);
    const signedTxs = transactions.map((t) => signTransaction(t, account.sk));
    await algoD.sendRawTransaction(signedTxs.map((t) => t.blob)).do();
    console.log(`Router opt-in successful`);
  } catch (error) {
    console.error(error.message);
  }
};
export default makeRouterOptIn;
