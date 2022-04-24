import axios from "axios";
import { poolProps, tinyProps } from "../types/types.js";
import { algofiFee } from "../utils/algofiFee.js";

const tinyUrl = "https://testnet.analytics.tinyman.org/api/v1/pools/?is_pool_member=true&limit=all&verified_only=false";
const algofiUrl = "https://thf1cmidt1.execute-api.us-east-2.amazonaws.com/Prod/amm_pools/?network=TESTNET";
const pactfiUrl = "https://api.testnet.pact.fi/api/pools";
const indexerUrl = "https://algoindexer.testnet.algoexplorerapi.io/v2";

const getAccounts = async (assets: number[]) => {
  let tinyman: tinyProps, algofi: poolProps, pactfi: poolProps;

  tinyman: {
    try {
      const { data: tinyData } = await axios.get(tinyUrl).catch(function (error) {
        throw new Error(
          error?.response?.data
            ? `error: ${error.response.status}  ${JSON.stringify(error.response.data)}`
            : error?.message
        );
      });
      // in Tinyman there is only one pool for any given trading pair
      const result = tinyData.results.find((r) => r["asset_1"].id == assets[1] && r["asset_2"].id == assets[0]);
      if (!result) break tinyman;
      tinyman = { pool: result.address, lt: Number(result["liquidity_asset"].id) };
    } catch (error) {
      console.error(error.message);
    }
  }

  algofi: {
    try {
      const { data: algofiData } = await axios.get(algofiUrl).catch(function (error) {
        throw new Error(
          error?.response?.data
            ? `error: ${error.response.status}  ${JSON.stringify(error.response.data)}`
            : error?.message
        );
      });
      const results = algofiData.pools.filter(
        (r) => (assets[0] === 0 ? r["asset_1"] == 1 : r["asset_1"] == assets[0]) && r["asset_2"] == assets[1]
      );

      // in Algofi there are 0.10 (nanopools), 0.25 and 0.75 fee pools.
      // If several pools are available we'll target the most liquid one to reduce price impact
      // Doing this initial filtering could be done in the smart contract but would be impractical
      // due to the limitations on the contracts array:
      // accounts + foreignApps + foreignAssets <= 8
      if (results.length === 0) break algofi;
      if (results.length === 1) {
        algofi = { app: results[0].id, fee: algofiFee(results[0]) };
        break algofi;
      }

      for (let i = 0; i < results.length; i += 1) {
        const { data } = await axios.get(`${indexerUrl}/applications/${results[i].id}`).catch(function (error) {
          throw new Error(
            error?.response?.data
              ? `error: ${error.response.status}  ${JSON.stringify(error.response.data)}`
              : error?.message
          );
        });
        const state = data?.application?.params?.["global-state"];
        const supply1 = state.find((g) => g.key === "YjE=")?.value?.uint;
        const supply2 = state.find((g) => g.key === "YjI=")?.value?.uint;
        results[i].liquidity = BigInt(supply1) * BigInt(supply2);
      }

      const mostLiquid = results.sort((a, b) =>
        a.liquidity > b.liquidity ? -1 : a.liquidity > b.liquidity ? 1 : 0
      )[0];
      algofi = { app: mostLiquid.id, fee: algofiFee(mostLiquid) };
    } catch (error) {
      console.error(error.message);
    }
  }

  pactfi: {
    try {
      const { data: pactfiData } = await axios
        .get(`${pactfiUrl}?primary_asset__algoid=${assets[0]}&secondary_asset__algoid=${assets[1]}`)
        .catch(function (error) {
          throw new Error(
            error?.response?.data
              ? `error: ${error.response.status}  ${JSON.stringify(error.response.data)}`
              : error?.message
          );
        });
      const results = pactfiData.results;
      // in Pactfi there can be many pools for a same asset pair, each with a different fee structure
      if (results.length === 0) break pactfi;
      if (results.length <= 1) {
        pactfi = { app: Number(results[0]?.appid), fee: results[0]?.fee_bps };
        break pactfi;
      }

      for (let i = 0; i < results.length; i += 1) {
        const { data } = await axios.get(`${indexerUrl}/applications/${results[i].appid}`).catch(function (error) {
          throw new Error(
            error?.response?.data
              ? `error: ${error.response.status}  ${JSON.stringify(error.response.data)}`
              : error?.message
          );
        });
        const state = data?.application?.params?.["global-state"];
        const supply1 = state.find((g) => g.key === Buffer.from("A", "utf8").toString("base64"))?.value?.uint;
        const supply2 = state.find((g) => g.key === Buffer.from("B", "utf8").toString("base64"))?.value?.uint;
        results[i].liquidity = BigInt(supply1) * BigInt(supply2);
      }

      const mostLiquid = results.sort((a, b) =>
        a.liquidity > b.liquidity ? -1 : a.liquidity > b.liquidity ? 1 : 0
      )[0];
      pactfi = { app: Number(mostLiquid.appid), fee: mostLiquid.fee_bps };
    } catch (error) {
      console.error(error.message);
    }
  }
  return { tinyman, algofi, pactfi };
};
export default getAccounts;
