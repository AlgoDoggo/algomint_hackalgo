import { getApplicationAddress } from "algosdk";
import axios from "axios";
import { routerApp } from "../constants/constants.js";

const indexerUrl = "https://testnet-idx.algonode.cloud/v2";

const getOptInStatus = async (
  asset1: number,
  asset2: number
): Promise<{ optedInAsset1: boolean; optedInAsset2: boolean } | undefined> => {
  try {
    const { data } = await axios
      .get(`${indexerUrl}/accounts/${getApplicationAddress(routerApp)}`)
      .catch(function (error) {
        throw new Error(
          error?.response?.data
            ? `error: ${error.response.status}  ${JSON.stringify(error.response.data)}`
            : error?.message
        );
      });
    const optedInAsset1 = asset1 == 0 ? true : data.account.assets.some((a) => a["asset-id"] == asset1);
    const optedInAsset2 = data.account.assets.some((a) => a["asset-id"] == asset2);
    return { optedInAsset1, optedInAsset2 };
  } catch (error) {
    console.error(error.message);
  }
};
export default getOptInStatus;
