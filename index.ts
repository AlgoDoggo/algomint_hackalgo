import dotenv from "dotenv";
import { USDC } from "./src/constants/constants.js";
import getAccounts from "./src/helpers/getAccounts.js";
dotenv.config();

const asset1=0
const asset2=USDC

const assets = [asset1,asset2];
assets.sort((a, b) => a - b);



await getAccounts(assets).catch(err=>console.log(err.message))