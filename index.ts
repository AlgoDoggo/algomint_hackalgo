import dotenv from "dotenv";
import smartRoute from "./examples/smartRoute.js";
import { goETH, USDC } from "./src/constants/constants.js";
import getAccounts from "./src/helpers/getAccounts.js";
import { sortAssets } from "./src/utils/sortAssets.js";
dotenv.config();

const asset1 = 0;
const asset2 = goETH;//USDC;

const swapParams = {
  assetIn: asset1,
  assetOut: asset2,
  amount: 100000,
  slippage: 25 // in basis points = 0.25%
};

try {
  const accounts = await getAccounts(sortAssets([asset1, asset2]));
  console.log(accounts);
  await smartRoute({ ...accounts, ...swapParams });
} catch (error) {
  console.error(error.message);
}
