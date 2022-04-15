import { encodeUint64, makeApplicationNoOpTxnFromObject, makePaymentTxnWithSuggestedParamsFromObject, mnemonicToSecretKey } from "algosdk";
import { setupClient } from "../adapters/algoD.js";
import { algofi, pact, tinyman, tinyValidatorApp, USDC } from "../constants/constants.js";

const smartRoute = async ({amount = 1000, assetOut = USDC}) => {


    

    const account = mnemonicToSecretKey(process.env.Mnemo!);
    let algodClient = await setupClient();
    const suggestedParams = await algodClient.getTransactionParams().do();

    const tx0 = makePaymentTxnWithSuggestedParamsFromObject({
        suggestedParams,


    })

    const tx1 = makeApplicationNoOpTxnFromObject({
        suggestedParams,
        from: account.addr,
        appIndex: metapool_app,
        // asset-out ID, 0 if algo
        appArgs: [encodeUint64(assetOut)],
        // tinyman, algofi, pactfi
        accounts: [tinyman,algofi, pact],
        // asset-in && asset-out
        foreignAssets: [USDC],
        foreignApps: [tinyValidatorApp],
      });
};
export default smartRoute
