export interface Swap {
  assetIn: number;
  amount: number | bigint;
  suggestedParams;
  assetOut: number;
  minAmountOut: number;
}

export interface SwapAlgoPact extends Swap {
  app: number;
}

export type poolProps =
  | {
      app: number;
      fee: number;
    }
  | undefined;

export type tinyProps =
  | {
      pool: string;
      lt: number;
    }
  | undefined;
