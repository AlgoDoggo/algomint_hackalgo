import pactsdk, { PactClient } from "@pactfi/pactsdk";
import algosdk, { decodeUint64, getApplicationAddress } from "algosdk";
import { setupClient } from "../adapters/algoD.js";
import { algofiApp, pactfiApp } from "../constants/constants.js";

const getAccounts = async ({ asset1, asset2 }) => {
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
