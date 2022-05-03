import dotenv from "dotenv";
import { goBTC, goETH, USDC } from "../src/constants/constants.js";
import Router from "../index.js";
dotenv.config();

const asset1 =0//goBTC// 0;
const asset2 = USDC//85590769// USDC//goETH// USDC;

try {
  const router = new Router(asset1, asset2, process.env.Mnemo!);
  await router.loadPools();
  await router.swap({ amount: 100, asset: asset1, slippage: 50 });
} catch (error) {
  console.error(error.message);
}
