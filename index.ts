import dotenv from "dotenv";
import smartRoute from "./examples/smartRoute.js";
import { USDC } from "./src/constants/constants.js";
import getAccounts from "./src/helpers/getAccounts.js";
import { sortAssets } from "./src/utils/sortAssets.js";
dotenv.config();

const asset1 = 0;
const asset2 = USDC;

const swapParams = {
  amount: 900,
  assetIn: asset1,
  assetOut: asset2,
};

try {
  const accounts = await getAccounts(sortAssets([asset1, asset2]));
  console.log(accounts);    
  await smartRoute({ ...accounts, ...swapParams });
} catch (error) {
  console.error(error.message);
}
