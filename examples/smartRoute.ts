import {
    assignGroupID,
  encodeUint64,
  getApplicationAddress,
  makeApplicationNoOpTxnFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
  mnemonicToSecretKey,
  signTransaction,
  waitForConfirmation,
} from "algosdk";
import { setupClient } from "../adapters/algoD.js";
import { algofi, algofiApp, pact, routerApp, tinyman, tinyValidatorApp, USDC } from "../constants/constants.js";
import dotenv from "dotenv"
dotenv.config()


const smartRoute = async ({ amount = 100, assetOut = USDC, algofiFee = 75 }) => {
    // const bs = \x00\x00\x00\x00\x00\x00\x00b
    // console.log(bs.toString())
    // return 
  const account = mnemonicToSecretKey(process.env.Mnemo!);
  
  let algodClient = await setupClient();
  const suggestedParams = await algodClient.getTransactionParams().do();

  suggestedParams.flatFee = true;
  suggestedParams.fee = 1000;

  const tx0 = makePaymentTxnWithSuggestedParamsFromObject({
    suggestedParams,
    from: account.addr,
    amount,
    to: getApplicationAddress(routerApp),
  });
  const tx1 = makeApplicationNoOpTxnFromObject({
    suggestedParams,
    from: account.addr,
    appIndex: routerApp,
    // asset-out ID, 0 if algo, algofi fee (25 or 75)
    appArgs: [encodeUint64(assetOut), encodeUint64(algofiFee)],
    // tinyman, algofi, pactfi
    accounts: [tinyman, algofi, pact],
    // asset-in && asset-out
    foreignAssets: [USDC],
    foreignApps: [tinyValidatorApp, algofiApp],
  });

  const transactions = [tx0, tx1];
  assignGroupID(transactions);
  const signedTxs = transactions.map((t) => signTransaction(t, account.sk));
  await algodClient.sendRawTransaction(signedTxs.map((t) => t.blob)).do();
  const transactionResponse = await waitForConfirmation(algodClient, signedTxs[1].txID, 5);
  const logs = transactionResponse?.logs?.map((l) => Buffer.from(l).toString());
  //const { aamt: stableOutAmount } = innerTX?.find((i) => i?.txn?.xaid === stableOut)?.txn;
  console.log(logs);

};
export default smartRoute;

smartRoute({ amount: 100, assetOut: USDC, algofiFee: 75 }).catch((err) => console.log(err.message));
