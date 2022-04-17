import pactsdk, { PactClient } from "@pactfi/pactsdk";
import algosdk, { decodeUint64, getApplicationAddress, LogicSigAccount } from "algosdk";
import { spawn } from "child_process";
import { setupClient } from "../adapters/algoD.js";
import { pactfiApp, tinyValidatorApp } from "../constants/constants.js";

const tinyUrl = "https://testnet.analytics.tinyman.org/api/v1/assets/?is_pool_member=true&limit=all&verified_only=false"

const getAccounts = async (assets: number[]) => {

  try {
    const {data}
  } catch (error) {
    
  }

  const python = spawn("python",[`src/utils/tinyPoolGen.py`, tinyValidatorApp.toString(), assets[0].toString(),assets[1].toString()]);
let algodClient =await setupClient()
 
  


  python.stdout.on('data', (data) => {
    const parsed = JSON.parse(data.toString())   
    const lsig = new LogicSigAccount(new Uint8Array(parsed));
    const address = lsig.address() 
    console.log(address)
});

  return
    // const config = "AAAAAAAAAAAAAAAAKWQzgQAAAAAAAAAe"
    // function decodeUint64Array(data: string): number[] {
    //     const buffer = Buffer.from(data, "base64");
    //     let offset = 0;
    //     const numbers: number[] = [];
    //     while (offset < buffer.length) {
    //       // We don't need bigints. The values will be small enough to fit into Number.
    //       numbers.push(Number(buffer.readBigUInt64BE(offset)));
    //       offset += 8;
    //     }
    //     return numbers;
    //   }

     // return console.log(decodeUint64Array(config))
   
    const algod = await setupClient();
    const pact = new PactClient(algod, { pactApiUrl: "api.testnet.pact.fi/" });
   // const algo = await pact.fetchAsset(asset1);
    //const otherCoin = await pact.fetchAsset(asset2);
console.log(pact)
    const pool = await pact.fetchPoolById(pactfiApp);
  //const pools = await pact.fetchPoolsByAssets(algo, otherCoin);
  console.log(pool);
};
export default getAccounts;
