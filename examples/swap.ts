import { getApplicationAddress } from "algosdk";
import dotenv from "dotenv";
import { goBTC, goETH, USDC } from "../src/constants/constants.js";
import Router from "../src/router.js";

dotenv.config();

const asset1 = 0;
const asset2 = 62483855//USDC;

try {
  const router = new Router(asset1, asset2, process.env.Mnemo!);
  await router.loadPools();
  console.log(router);
  await router.swap({ amount: 500, asset: asset1, slippage: 50 });
  

} catch (error) {
  console.error(error.message);
}
