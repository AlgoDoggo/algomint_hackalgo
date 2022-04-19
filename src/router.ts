import getAccounts from "./helpers/getAccounts.js";
import getOptInStatus from "./helpers/getOptInStatus.js";
import smartRoute from "./smartRoute.js";
import { poolProps, tinyProps } from "./types/types.js";
import { sortAssets } from "./utils/sortAssets.js";
import dotenv from "dotenv"
import makePoolOptIn from "./makePoolOptIn.js";

dotenv.config();

class Router {
  asset1: number = 0;
  asset2: number;
  tinyman: tinyProps;
  algofi: poolProps;
  pactfi: poolProps;
  optedInAsset1?: boolean;
  optedInAsset2?: boolean;

  constructor(asset1: number, asset2: number) {
    if (asset1 == asset2) throw new Error("the two assets cannot be identical");
    if (asset1 < 0 || asset2 < 0 || Math.floor(asset1) != asset1 || Math.floor(asset2) != asset2) {
      throw new Error("assets must be positive integers");
    }
    const assets = sortAssets([asset1, asset2]);
    this.asset1 = assets[0];
    this.asset2 = assets[1];
  }

  async loadPools() {
    const { tinyman, algofi, pactfi } = await getAccounts([this.asset1, this.asset2]);
    this.tinyman = tinyman;
    this.algofi = algofi;
    this.pactfi = pactfi;

    // let's also check whether the contract is opted-in the relevant assets
    const status = await getOptInStatus(this.asset1, this.asset2);
    this.optedInAsset1 = status?.optedInAsset1;
    this.optedInAsset2 = status?.optedInAsset2;
  }

  async swap({ amount, asset, slippage }) {
    if (asset != this.asset1 && asset != this.asset2) throw new Error("asset mismatch");
    // if contract hasn't opted-in the asset, it needs to
    if(this.optedInAsset1 === false){
      console.log("The router needs to opt-in asset 1")
      await makePoolOptIn(this.asset1)
    }
    if(this.optedInAsset2 === false){
      console.log("The router needs to opt-in asset 1")
      await makePoolOptIn(this.asset2)
    }
    return await smartRoute({
      amount,
      assetIn: asset,
      assetOut: asset === this.asset1 ? this.asset2 : this.asset1,
      tinyman: this.tinyman,
      algofi: this.algofi,
      pactfi: this.pactfi,
      slippage: slippage,
    });
  }
}

export default Router;
