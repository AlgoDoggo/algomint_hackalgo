import dotenv from "dotenv";
import smartRoute from "./examples/smartRoute.js";
import { USDC } from "./src/constants/constants.js";
import getAccounts from "./src/helpers/getAccounts.js";
import { sortAssets } from "./src/utils/sortAssets.js";
dotenv.config();

const asset1 = 0;
const asset2 = USDC;

const swapParams = {
  amount: 90,
  assetIn: 0,
  assetOut: USDC,
  algofiFee: 75,
  pactfiFee: 30,
};
try {
  const accounts = await getAccounts(sortAssets([asset1, asset2]));
  await smartRoute({ ...accounts, ...swapParams });
  console.log(accounts);

  
} catch (error) {
  console.error(error.message);
}
