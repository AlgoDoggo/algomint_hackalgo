import { algofiQuoteTeal } from "./branches/algofiQuoteTeal.js";
import { optIn } from "./branches/optInTeal.js";
import { pactfiQuote } from "./branches/pactfiQuoteTeal.js";
import { tinyQuoteTeal } from "./branches/tinyQuoteTeal.js";

export const appTeal = () : string => `
// scratch space :
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
// 17 : algofi loop counter

// 11 : opt-in loop

// pactfi
// 12 : asset-in supply in pactfi pool
// 13 : asset-out supply in pactfi pool
// 14 : Asset-out amount with pactfi
// 15 : pactfi Pool fee, usually 9970 (0.3%)
// 18 : pactfi loop counter

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

// Allow Opt-in.
txn OnCompletion
int OptIn
==
bnz allow

// Allow bootstrap
txna ApplicationArgs 0
byte "optIn"
==
bnz optIn

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
btoi
dup
store 3
load 1
!=
assert // check asset-in is not asset-out !

${tinyQuoteTeal}

algofi_loop:
${algofiQuoteTeal}

pactfi_loop:
${pactfiQuote}

// Which one is the best quote ?

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


// Here since i can't do the swap onchain because of current limitations on
// Tinyman, Algofi and Pacti contract, I am going to send the asset back to the user
// and do the swap in the front-end instead
itxn_begin

load 1 // ID of asset-out
bz send_back_algos

int axfer
itxn_field TypeEnum
load 1 
itxn_field XferAsset
load 2 // amount of asset-in
itxn_field AssetAmount
txn Sender
itxn_field AssetReceiver

b finish_redeem

send_back_algos:

int pay
itxn_field TypeEnum
load 2 // amount of asset-in
itxn_field Amount
txn Sender
itxn_field Receiver

finish_redeem:
int 0
itxn_field Fee

itxn_submit

allow:
int 1
return

optIn:
${optIn}

`;
