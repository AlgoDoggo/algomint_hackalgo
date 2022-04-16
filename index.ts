import dotenv from "dotenv";
import { USDC } from "./src/constants/constants.js";
import getAccounts from "./src/helpers/getAccounts.js";
dotenv.config();

const asset1=0
const asset2=USDC

await getAccounts({asset1, asset2}).catch(err=>console.log(err.message))