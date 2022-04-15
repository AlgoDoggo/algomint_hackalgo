import dotenv from "dotenv";
import { USDC } from "./constants/constants.js";
import getAccounts from "./helpers/getAccounts.js";
dotenv.config();

const asset1=0
const asset2=USDC

await getAccounts({asset1, asset2})