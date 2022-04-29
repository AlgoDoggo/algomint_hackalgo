import { SuggestedParams } from "algosdk";

export interface Swap {
  assetIn: number;
  amount: number | bigint;
  suggestedParams: SuggestedParams;
  assetOut: number;
  minAmountOut: number;
  mnemo: string;
}

export interface SwapAlgoPact extends Swap {
  app: number;
}

export type PoolProps =
  | {
      app: number;
      fee: number;
    }
  | undefined;

export type TinyProps =
  | {
      pool: string;
      lt: number;
    }
  | undefined;

export type RouterSwap = {
  amount: number | bigint;
  asset: number;
  slippage: number;
};

export type AppGlobalState = {};

export type AlgoFiResult = {
  id: number;
  asset_1: number;
  asset_2: number;
  lp_asset: number;
  validator_index: number;
  asset_1_unit_name: string;
  asset_2_unit_name: string;
  liquidity: bigint;
};

export type AlgoFiPool = {
  pools: AlgoFiResult[];
};

export type IndexerAccountAsset = {
  amount: number;
  "asset-id": number;
  deleted: boolean;
  "is-frozen": boolean;
  "opted-in-at-round": number;
};

export type IndexerAccountLocalState = {
  "closed-out-at-round": number;
  deleted: boolean;
  id: number;
  "key-value"?: {
    key: string;
    value: {
      bytes: string;
      type: number;
      uint: number;
    };
  }[];
  "opted-in-at-round": number;
  schema: {
    "num-byte-slice": number;
    "num-uint": number;
  };
};
