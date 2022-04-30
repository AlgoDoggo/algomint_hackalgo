import { algofiQuoteTeal } from "./branches/algofiQuoteTeal.js";
import { algofiSwap } from "./branches/algofiSwapTeal.js";
import { optIn } from "./branches/optInTeal.js";
import { pactfiQuote } from "./branches/pactfiQuoteTeal.js";
import { pactfiSwap } from "./branches/pactfiSwapTeal.js";
import { sendAsset } from "./branches/sendAssetTeal.js";
import { tinyQuoteTeal } from "./branches/tinyQuoteTeal.js";
import { tinySwap } from "./branches/tinySwapTeal.js";

export const appTeal = () : string => `
// scratch space gtxn 1 :
// 1 : asset-in ID, 0 if algo
// 2 : asset-in amount
// 3 : asset-out ID

// tinyman
// 4 : asset-in supply in Tiny pool
// 5 : asset-out supply in Tiny pool
// 6 : Asset-out amount with Tinyman

// algofi
// 7 : asset-in supply in algofi pool
// 8 : asset-out supply in algofi pool
// 9 : Asset-out amount with algofi
// 10 : algofi Pool fee either 9925 or 9975

// 11 : opt-in loop

// pactfi
// 12 : asset-in supply in pactfi pool
// 13 : asset-out supply in pactfi pool
// 14 : Asset-out amount with pactfi
// 15 : pactfi Pool fee, usually 9970 (0.3%)

// 16 : best quote: either "Tinyman", "Algofi", "Pactfi"



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

// Allow bootstrap and router opting-in assets
txna ApplicationArgs 0
byte "optIn"
==
global GroupSize
int 2
==
&&
bnz optIn

// The rest of the app works with a group of 3
global GroupSize
int 3
==
assert

// let's verify the quote app call (gtxn 1) and swap app call (gtxn 2) are both calling here
gtxn 1 ApplicationID
gtxn 2 ApplicationID
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


// 3d place in the group is the app call to do the swapping
txn GroupIndex
int 2
==
bnz lets_swap


// store asset-out ID
txna ApplicationArgs 0
btoi
dup
store 3
load 1
!=
assert // check asset-in is not asset-out !

${tinyQuoteTeal}

${algofiQuoteTeal}

${pactfiQuote}

// Which one is the best quote ?

// Verify at least one of the quote is not zero
load 6
int 0
!=
load 9
int 0
!=
||
load 14
int 0
!=
||
assert

byte "Tinyman"
byte "Algofi"
load 9
load 6
>
select // either tinyman or algofi on stack
byte "Pactfi"
load 14
load 9
load 6
dig 4 // either tinyman or algofi
byte "Tinyman"
==
select // now either load 6 or 9 on stack
>
select
dup
store 16
byte "Best quote from: "
swap
concat
log

// log is complete, let's return and do the swap in the next app call
b allow


lets_swap:

// getting asset-out id from previous app call
gload 1 3
store 3


///////////////////////////////////// bypass
b tinyman_swap 
////////////////////////////////////// remove line above after protocol upgrades


// 16th scratch space value of first app call
gload 1 16
byte "Pactfi"
==
bnz pactfi_swap

gload 1 16
byte "Algofi"
==
bnz algofi_swap

b tinyman_swap // if it's neither Pactfi nor Algofi it's Tinyman


///////////////////// branches

optIn:
${optIn}

pactfi_swap:
${pactfiSwap}

algofi_swap:
${algofiSwap}

tinyman_swap:
${tinySwap}

send_asset_to_user:
${sendAsset}

finish_send_back:
int 0
itxn_field Fee

itxn_submit


allow:
int 1

`;
