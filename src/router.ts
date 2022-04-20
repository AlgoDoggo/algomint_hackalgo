import getAccounts from "./helpers/getAccounts.js";
import getOptInStatus from "./helpers/getOptInStatus.js";
import smartRoute from "./smartRoute.js";
import { poolProps, tinyProps } from "./types/types.js";
import { sortAssets } from "./utils/sortAssets.js";
import makeRouterOptIn from "./makeRouterOptIn.js";
import { getApplicationAddress, mnemonicToSecretKey } from "algosdk";
import { routerApp } from "./constants/constants.js";
import makeUserOptIn from "./makeUserOptIn.js";

class Router {
  asset1: number = 0;
  asset2: number;
  mnemo: string;
  tinyman: tinyProps;
  algofi: poolProps;
  pactfi: poolProps;
  routerOptInA1?: boolean = true;
  routerOptInA2?: boolean = true;
  userOptInA1?: boolean = true;
  userOptInA2?: boolean = true;
  userOptInTiny?: boolean = true;

  constructor(asset1: number, asset2: number, mnemo: string) {
    if (arguments.length != 3) throw new Error("missing parameters");
    if (asset1 == asset2) throw new Error("the two assets cannot be identical");
    if (asset1 < 0 || asset2 < 0 || Math.floor(asset1) != asset1 || Math.floor(asset2) != asset2) {
      throw new Error("assets must be positive integers");
    }
    const assets = sortAssets([asset1, asset2]);
    this.asset1 = assets[0];
    this.asset2 = assets[1];
    this.mnemo = mnemo;
  }

  // get router up-to-date with tinyman, algofi and pactfi pools and apps
  async loadPools() {
    const { tinyman, algofi, pactfi } = await getAccounts([this.asset1, this.asset2]);
    this.tinyman = tinyman;
    this.algofi = algofi;
    this.pactfi = pactfi;

    // let's check whether the contract is opted-in the relevant assets
    const routerStatus = await getOptInStatus(this.asset1, this.asset2, getApplicationAddress(routerApp));
    this.routerOptInA1 = routerStatus?.optedInAsset1;
    this.routerOptInA2 = routerStatus?.optedInAsset2;

    // let's also check whether the user is opted-in the relevant assets
    const UserStatus = await getOptInStatus(this.asset1, this.asset2, mnemonicToSecretKey(this.mnemo).addr);
    this.userOptInA1 = UserStatus?.optedInAsset1;
    this.userOptInA2 = UserStatus?.optedInAsset2;
    this.userOptInTiny = UserStatus?.optedInTinyApp;
  }

  // slippage in basis point: 0.1% = 10
  async swap({ amount, asset, slippage }) {
    if (asset != this.asset1 && asset != this.asset2) {
      throw new Error("Asset input does not match router's assets");
    }

    // if router contract hasn't opted-in the asset, it needs to
    if (this.routerOptInA1 === false || this.routerOptInA2 === false) {
      console.log("The router needs to opt-in the swapped assets");
      let assets: number[] = [];
      if (this.routerOptInA1 === false) assets.push(this.asset1);
      if (this.routerOptInA2 === false) assets.push(this.asset2);
      await makeRouterOptIn(assets, this.mnemo);
      this.routerOptInA1 = true;
      this.routerOptInA2 = true;
    }

    // if user hasn't opted-in the assets or the tiny app, it needs to
    if (!this.userOptInA1 || !this.userOptInA2 || !this.userOptInTiny) {
      console.log("The user needs to opt-in the swapped assets");
      let assets: number[] = [];
      if (!this.userOptInA1) assets.push(this.asset1);
      if (!this.userOptInA2) assets.push(this.asset2);
      if (!this.userOptInTiny) {
        await makeUserOptIn(assets, this.mnemo, true);
      } else {
        await makeUserOptIn(assets, this.mnemo, false);
      }
      this.userOptInA1 = true;
      this.userOptInA2 = true;
      this.userOptInTiny = true;
    }

    return await smartRoute({
      amount,
      assetIn: asset,
      assetOut: asset === this.asset1 ? this.asset2 : this.asset1,
      tinyman: this.tinyman,
      algofi: this.algofi,
      pactfi: this.pactfi,
      slippage: slippage,
      mnemo: this.mnemo,
    });
  }
}

export default Router;
