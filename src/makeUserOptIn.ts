import { makeApplicationOptInTxnFromObject, makeAssetTransferTxnWithSuggestedParamsFromObject, mnemonicToSecretKey, signTransaction } from "algosdk";
import { algoD } from "./adapters/algoD.js";
import { tinyValidatorApp } from "./constants/constants.js";

const makeUserOptIn = async (assets: number[], mnemo: string, tiny: boolean): Promise<void> => {
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

  if(tiny){
    const appOptIn = makeApplicationOptInTxnFromObject({
      suggestedParams,
      from: account.addr,
      appIndex: tinyValidatorApp
    })
    await algoD.sendRawTransaction(signTransaction(appOptIn, account.sk).blob).do();
    console.log(`User successfully opted-in Tinyman App`);
  }
};
export default makeUserOptIn;
