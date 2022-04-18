import pactsdk, { PactClient } from "@pactfi/pactsdk";
import algosdk, { decodeUint64, getApplicationAddress, LogicSigAccount } from "algosdk";
import axios from "axios";
import { spawn } from "child_process";
import { setupClient } from "../adapters/algoD.js";
import { pactfiApp, tinyValidatorApp } from "../constants/constants.js";

const tinyUrl = "https://testnet.analytics.tinyman.org/api/v1/pools/?is_pool_member=true&limit=all&verified_only=false";
const algofiUrl = "https://thf1cmidt1.execute-api.us-east-2.amazonaws.com/Prod/amm_pools/?network=TESTNET";

interface Accounts {
  (assets: number[]): Promise<{
    tinyPool: string;
    tinyLT: number;
    algofi: {
      app: number;
      fee: number;
    }[];
  }>;
}

const getAccounts: Accounts = async (assets) => {
  let tinyPool,
    tinyLT,
    algofi: any[] = [];

  try {
    const { data: tinyData } = await axios.get(tinyUrl).catch(function (error) {
      throw new Error(
        error?.response?.data ? `error: ${error.response.status}  ${JSON.stringify(error.response.data)}` : error?.message
      );
    });

    const result = tinyData.results.find((r) => r["asset_1"].id == assets[1] && r["asset_2"].id == assets[0]);
    tinyPool = result.address;
    tinyLT = Number(result["liquidity_asset"].id);
  } catch (error) {
    console.error(error.message);
  }

  try {
    const { data: algofiData } = await axios.get(algofiUrl).catch(function (error) {
      throw new Error(
        error?.response?.data ? `error: ${error.response.status}  ${JSON.stringify(error.response.data)}` : error?.message
      );
    });
    const results = algofiData.pools.filter(
      (r) => (assets[0] === 0 ? r["asset_1"] == 1 : r["asset_1"] == assets[0]) && r["asset_2"] == assets[1]
    );
    if (results.length > 2) throw new Error("Too many AlgoFi pools found");

    for (let i = 0; i < results.length; i += 1) {
      let fee;
      if (results[i]["validator_index"] == 0) {
        fee = 25;
      } else if (results[i]["validator_index"] == 1) {
        fee = 75;
      }
      algofi.push({ app: results[i].id, fee });
    }
  } catch (error) {
    console.error(error.message);
  }

  return { tinyPool, tinyLT, algofi };  

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
