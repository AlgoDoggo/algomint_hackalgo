import dotenv from "dotenv";
import { goETH, USDC } from "./src/constants/constants.js";
import Router from "./src/router.js";

const asset1 = 54215619;
const asset2 = 0; //USDC;

try {
  const router = new Router(asset1, asset2);
  await router.loadPools();
  console.log(router);
  await router.swap({ amount: 100, asset: 0, slippage: 50 });
} catch (error) {
  console.error(error.message);
}
