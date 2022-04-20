import dotenv from "dotenv";
import { USDC } from "../src/constants/constants.js";
import Router from "../index.js";
dotenv.config();

const asset1 = 0;
const asset2 = USDC;

try {
  const router = new Router(asset1, asset2, process.env.Mnemo!);
  await router.loadPools();
  await router.swap({ amount: 500, asset: asset1, slippage: 50 });
} catch (error) {
  console.error(error.message);
}
