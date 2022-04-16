import {
  assignGroupID,
  decodeUint64,
  encodeUint64,
  getApplicationAddress,
  makeApplicationNoOpTxnFromObject,
  makeAssetTransferTxnWithSuggestedParamsFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
  mnemonicToSecretKey,
  signTransaction,
  waitForConfirmation,
} from "algosdk";
import { setupClient } from "../adapters/algoD.js";
import { algofi, algofiApp, pact, routerApp, tinyman, tinyValidatorApp, USDC } from "../constants/constants.js";
import dotenv from "dotenv";
dotenv.config();

const smartRoute = async ({ amount = 100, assetIn = 0, assetOut = USDC, algofiFee = 75 }) => {
  const account = mnemonicToSecretKey(process.env.Mnemo!);

  let algodClient = await setupClient();
  const suggestedParams = await algodClient.getTransactionParams().do();

  suggestedParams.flatFee = true;
  suggestedParams.fee = 1000;
  let tx0;
  if (assetIn === 0) {
    tx0 = makePaymentTxnWithSuggestedParamsFromObject({
      suggestedParams,
      from: account.addr,
      amount,
      to: getApplicationAddress(routerApp),
    });
  } else {
    tx0 = makeAssetTransferTxnWithSuggestedParamsFromObject({
      suggestedParams,
      from: account.addr,
      amount,
      to: getApplicationAddress(routerApp),
      assetIndex: assetIn,
    });
  }
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
  const logs = transactionResponse?.logs?.map((l, i) =>
    i % 2 === 0 ? l.toString() : decodeUint64(new Uint8Array(Buffer.from(l)), "mixed")
  );
  console.log(`Here is your quote for ${amount} of your asset against asset n°${assetOut}`)
  console.log(`${logs[0]} quote: ${logs[1]}, ${logs[2]} quote: ${logs[3]}}`);
};
export default smartRoute;

smartRoute({}).catch((err) => console.log(err.message));
