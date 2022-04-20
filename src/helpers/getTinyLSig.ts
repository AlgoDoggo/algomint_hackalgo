import { LogicSigAccount } from "algosdk";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { tinyValidatorApp } from "../constants/constants.js";

const getTinyLSig = async (assets: number[]): Promise<LogicSigAccount> => {
  const url = new URL("../utils/tinyPoolGen.py", import.meta.url);
  const file = fileURLToPath(url);

  const python = spawn("python", [file, tinyValidatorApp.toString(), assets[0].toString(), assets[1].toString()]);

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
export default getTinyLSig;
