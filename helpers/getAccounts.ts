import { PactClient } from "@pactfi/pactsdk";
import { getApplicationAddress } from "algosdk";
import { setupClient } from "../adapters/algoD.js";
import { appAlgofi, appPact } from "../constants/constants.js";

const getAccounts = async({asset1, asset2})=> {
    console.log(getApplicationAddress(appAlgofi))
    return console.log(getApplicationAddress(appPact))
    console.log(asset1, asset2)
    const algod = await setupClient()
    const pact = new PactClient(algod, {pactApiUrl: "https://api.testnet.pact.fi"});
    const pools = await pact.fetchPoolsByAssets(asset1, asset2)
 console.log(pools)
}
export default getAccounts