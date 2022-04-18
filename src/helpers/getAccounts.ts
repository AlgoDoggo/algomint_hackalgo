import axios from "axios";

const tinyUrl = "https://testnet.analytics.tinyman.org/api/v1/pools/?is_pool_member=true&limit=all&verified_only=false";
const algofiUrl = "https://thf1cmidt1.execute-api.us-east-2.amazonaws.com/Prod/amm_pools/?network=TESTNET";
const pactfiUrl = "https://api.testnet.pact.fi/api/pools";

export type appArray = {
  app: number;
  fee: number;
}[];

interface Accounts {
  (assets: number[]): Promise<{
    tinyPool: string;
    tinyLT: number;
    algofi: appArray;
    pactfi: appArray;
  }>;
}

const getAccounts: Accounts = async (assets) => {
  let tinyPool,
    tinyLT,
    algofi: any[] = [],
    pactfi: any[] = [];

  try {
    const { data: tinyData } = await axios.get(tinyUrl).catch(function (error) {
      throw new Error(
        error?.response?.data ? `error: ${error.response.status}  ${JSON.stringify(error.response.data)}` : error?.message
      );
    });
    // in Tinyman there is only one pool for any given trading pair
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
    if (results.length > 3) throw new Error("Too many AlgoFi pools found");

    // in Algofi there are 0.10 (nanopools), 0.25 and 0.75 fee pools.
    for (let i = 0; i < results.length; i += 1) {
      let fee;
      if (results[i]["validator_index"] == 0) {
        fee = 25;
      } else {
        fee = 75;
      }
      algofi.push({ app: results[i].id, fee });
    }
  } catch (error) {
    console.error(error.message);
  }

  try {
    const { data: pactfiData } = await axios
      .get(`${pactfiUrl}?primary_asset__algoid=${assets[0]}&secondary_asset__algoid=${assets[1]}`)
      .catch(function (error) {
        throw new Error(
          error?.response?.data ? `error: ${error.response.status}  ${JSON.stringify(error.response.data)}` : error?.message
        );
      });
    const results = pactfiData.results;
    // in Pactfi there can be many pools for a same asset pair, with a different structure
    for (let i = 0; i < results.length; i += 1) {
      pactfi.push({ app: Number(results[i].appid), fee: results[i].fee_bps });
    }
  } catch (error) {
    console.error(error.message);
  }
  return { tinyPool, tinyLT, algofi, pactfi };
};
export default getAccounts;
