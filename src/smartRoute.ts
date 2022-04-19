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
import { routerApp, tinyValidatorApp, USDC, zeroAddress } from "./constants/constants.js";
import swapAlgofi from "./swapAlgofi.js";
import swapPactfi from "./swapPactfi.js";
import swapTinyman from "./swapTinyman.js";
import { algoD } from "./adapters/algoD.js";
import { poolProps, tinyProps } from "./types/types.js";

interface smartRoute {
  ({}: {
    amount: number;
    assetIn: number;
    assetOut: number;
    tinyman: tinyProps;
    algofi: poolProps;
    pactfi: poolProps;
    slippage: number;
    mnemo: string;
  }): Promise<void>;
}

const smartRoute: smartRoute = async ({
  amount = 100,
  assetIn = USDC,
  assetOut = 0,
  tinyman,
  algofi,
  pactfi,
  slippage = 50,
  mnemo,
}) => {
  try {
    if (!tinyman && !algofi && !pactfi) throw new Error("No pools found for this asset pair");
    const account = mnemonicToSecretKey(mnemo);
    const suggestedParams = await algoD.getTransactionParams().do();
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
        fee: suggestedParams.fee * 2, //(fee is 2x because I have to send back the asset I'm sending to the contract
      },
      from: account.addr,
      appIndex: routerApp,
      appArgs: [
        encodeUint64(assetOut), // asset-out ID - 0 if algo
        encodeUint64(algofi?.fee ?? 0), // 10, 25 or 75
        encodeUint64(pactfi?.fee ?? 0), // any number between 1-100
      ],
      // tinyman, algofi, pactfi
      accounts: [
        tinyman?.pool ?? zeroAddress,
        algofi?.app ? getApplicationAddress(algofi.app) : zeroAddress,
        pactfi?.app ? getApplicationAddress(pactfi.app) : zeroAddress,
      ],
      // asset-in && asset-out
      foreignAssets: [assetIn, assetOut],
      // tinyman, algofi, pactfi
      foreignApps: [tinyValidatorApp, algofi?.app ?? 0, pactfi?.app ?? 0],
    });
    const transactions = [tx0, tx1];
    assignGroupID(transactions);
    const signedTxs = transactions.map((t) => signTransaction(t, account.sk));
    await algoD.sendRawTransaction(signedTxs.map((t) => t.blob)).do();
    const transactionResponse = await waitForConfirmation(algoD, signedTxs[1].txID, 5);
    const logs = transactionResponse?.logs?.map((l, i) =>
      i % 2 === 0 ? l.toString() : decodeUint64(new Uint8Array(Buffer.from(l)), "mixed")
    );
    console.log(
      `Your quote for ${amount} ${assetIn === 0 ? "microAlgos" : "of your asset"} against ${
        assetOut === 0 ? "microAlgos" : `asset n°${assetOut}`
      }`
    );
    console.log(`${logs[0]} quote: ${logs[1]}, ${logs[2]} quote: ${logs[3]}, ${logs[4]} quote: ${logs[5]}`);
    console.log(logs[6]);
    if (logs[6].slice(17) == "Tinyman") {
      await swapTinyman({
        assetIn,
        amount,
        suggestedParams,
        tinyPool: tinyman?.pool!,
        assetOut,
        tinyLT: tinyman?.lt!,
        minAmountOut: Math.floor((logs[1] * (10000 - slippage)) / 10000),
        mnemo,
      });
    } else if (logs[6].slice(17) == "Algofi") {
      await swapAlgofi({
        assetIn,
        amount,
        app: algofi?.app!,
        suggestedParams,
        assetOut,
        minAmountOut: Math.floor((logs[3] * (10000 - slippage)) / 10000),
        mnemo,
      });
    } else if (logs[6].slice(17) == "Pactfi") {
      await swapPactfi({
        assetIn,
        amount,
        app: pactfi?.app!,
        suggestedParams,
        assetOut,
        minAmountOut: Math.floor((logs[5] * (10000 - slippage)) / 10000),
        mnemo,
      });
    }
  } catch (error) {
    console.error(error.message);
  }
};
export default smartRoute;
