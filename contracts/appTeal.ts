import { tinyValidatorApp } from "../constants/constants";
import { tinyQuoteTeal } from "./tinyQuoteTeal";


interface App {
  ({}: {
    
  }): string;
}

export const appTeal : App = ({
 
}) => `
// scratch space :
// 1 : asset-in ID, 0 if algo
// 2 : asset-in amount
// 3 : asset-out ID
// 4 : asset-in supply in Tiny pool
// 5 : asset-out supply in Tiny pool

// 6 : Asset-out amount with Tinyman

#pragma version 6


// Allow creation
txn ApplicationID
bz allow

// We're making this contract immutable
txn OnCompletion
int UpdateApplication
!=
txn OnCompletion
int DeleteApplication
!=
&&
txn OnCompletion
int CloseOut
!=
&&
assert

// Allow Opt-in.
txn OnCompletion
int OptIn
==
bnz allow

//Making sure the assets or algos are coming to this account
global CurrentApplicationAddress
gtxn 0 AssetReceiver
gtxn 0 Receiver
gtxn 0 TypeEnum
int pay
==
select
==
assert

// store asset-in ID
gtxn 0 XferAsset
int 0
gtxn 0 TypeEnum
int pay
==
select
store 1

// store asset-in amount
gtxn 0 AssetAmount
gtxn 0 Amount
gtxn 0 TypeEnum
int pay
==
select
store 2

// store asset-out ID
txna ApplicationArgs 0
dup
store 3
load 1
!=
assert // check asset-in is not asset-out !

${tinyQuoteTeal}


err


// branches


//common subroutines



// end of program

// Checking fees is necessary for metaswap and metazap only
checkFees: 
${checkFeesTeal}  

allow:
int 1

`;
