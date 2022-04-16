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
import { setupClient } from "../src/adapters/algoD.js";
import { algofi, algofiApp, pact, pactfiApp, routerApp, tinyman, tinyValidatorApp, tmpool, USDC } from "../src/constants/constants.js";
import dotenv from "dotenv";
import swapAlgofi from "../src/helpers/swapAlgofi.js";
import swapPactfi from "../src/helpers/swapPactfi.js";
import swapTinyman from "../src/helpers/swapTinyman.js";
dotenv.config();

const smartRoute = async ({ amount = 100, assetIn = 0, assetOut = USDC, algofiFee = 75 ,pactfiFee = 30}) => {
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
    suggestedParams: {
      ...suggestedParams,
      fee: suggestedParams.fee * 2, //(fee is 5x for nanoswap 2x for regular swap)
    },
    from: account.addr,
    appIndex: routerApp,
    // asset-out ID, 0 if algo, algofi fee (25 or 75)
    appArgs: [encodeUint64(assetOut), encodeUint64(algofiFee),encodeUint64(pactfiFee)],
    // tinyman, algofi, pactfi
    accounts: [tinyman, algofi, pact],
    // asset-in && asset-out
    foreignAssets: [USDC],
    foreignApps: [tinyValidatorApp, algofiApp, pactfiApp],
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
  console.log(`${logs[0]} quote: ${logs[1]}, ${logs[2]} quote: ${logs[3]}, ${logs[4]} quote: ${logs[5]}`);
  
  //swapAlgofi({assetIn, amount, app: algofiApp ,suggestedParams,assetOut})
  swapTinyman({ assetIn, amount, suggestedParams, tinypool: tinyman, assetOut, tmpool, minAmountOut: logs[1] }).catch((err) => console.log(err.message))
  //swapPactfi({assetIn, amount, app: pactfiApp ,suggestedParams,assetOut})
};
export default smartRoute;

smartRoute({}).catch((err) => console.log(err.message));
