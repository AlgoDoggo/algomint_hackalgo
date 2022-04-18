import pactsdk, { PactClient } from "@pactfi/pactsdk";
import algosdk, { decodeUint64, getApplicationAddress, LogicSigAccount } from "algosdk";
import axios from "axios";
import { spawn } from "child_process";
import { setupClient } from "../adapters/algoD.js";
import { pactfiApp, tinyValidatorApp } from "../constants/constants.js";

const tinyUrl = "https://testnet.analytics.tinyman.org/api/v1/pools/?is_pool_member=true&limit=all&verified_only=false";

const getAccounts = async (assets: number[]) => {
  let tinyPool, tinyLT;

  try {
    const { data: tinyData } = await axios.get(`${tinyUrl}`).catch(function (error) {
      throw new Error(
        error?.response?.data ? `error: ${error.response.status}  ${JSON.stringify(error.response.data)}` : error?.message
      );
    });

    const result = tinyData.results.find((r) => r["asset_1"].id == assets[1].toString() && r["asset_2"].id == assets[0]);
    tinyPool = result.address;
    tinyLT = Number(result["liquidity_asset"].id);
  } catch (error) {
    console.error(error.message);
  }

  return { tinyPool, tinyLT };
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
  console.log(pact);
  const pool = await pact.fetchPoolById(pactfiApp);
  //const pools = await pact.fetchPoolsByAssets(algo, otherCoin);
  console.log(pool);
};
export default getAccounts;
