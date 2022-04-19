import { makeAssetTransferTxnWithSuggestedParamsFromObject, mnemonicToSecretKey, signTransaction } from "algosdk";
import { algoD } from "./adapters/algoD.js";

const makeUserOptIn = async (assets: number[], mnemo: string): Promise<void> => {
  const account = mnemonicToSecretKey(mnemo);
  const suggestedParams = await algoD.getTransactionParams().do();
  suggestedParams.flatFee = true;
  suggestedParams.fee = 1000;

  for (let i = 0; i < assets.length; i++) {
    const optin = makeAssetTransferTxnWithSuggestedParamsFromObject({
      suggestedParams,
      from: account.addr,
      to: account.addr,
      assetIndex: assets[i],
      amount: 0,
    });
    await algoD.sendRawTransaction(signTransaction(optin, account.sk).blob).do();
    console.log(`User successfully opted-in asset n° ${assets[i]}`);
  }
};
export default makeUserOptIn;
