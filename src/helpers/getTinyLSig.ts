import { LogicSigAccount } from "algosdk";
import { spawn } from "child_process";
import { tinyValidatorApp } from "../constants/constants.js";

export const getTinyLSig = async (assets: number[]): Promise<LogicSigAccount> => {
  const python = spawn("python", [
    `src/utils/tinyPoolGen.py`,
    tinyValidatorApp.toString(),
    assets[0].toString(),
    assets[1].toString(),
  ]);

  const lsig: LogicSigAccount = await new Promise((resolve, reject) => {
    python.stdout.on("data", (data) => {
      const parsed = JSON.parse(data.toString());
      resolve(new LogicSigAccount(new Uint8Array(parsed)));
    });

    python.stderr.on("data", (data) => {
      console.error(data.toString());
      reject(new Error("Cannot retrieve Tinyman LogicSig"));
    });
  });

  return lsig;
};
