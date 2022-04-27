export const sendAsset = `

// if the best quote is from Tinyman send back the asset-in to do the trade in the front-end
// else send back the result of the successful swap (Pactfi && Algofi)
load 16
byte "Tinyman"
==
bz swap_successful


itxn_begin

load 1 // ID of asset-in
bz redeem_algos

int axfer
itxn_field TypeEnum
load 1 
itxn_field XferAsset
load 2 // amount of asset-in
itxn_field AssetAmount
txn Sender
itxn_field AssetReceiver

b finish_send_back

redeem_algos:

int pay
itxn_field TypeEnum
load 2 // amount of asset-in
itxn_field Amount
txn Sender
itxn_field Receiver

b finish_send_back


swap_successful:
itxn_begin

load 3 // ID of asset-out
bz swapped_for_algos

int axfer
itxn_field TypeEnum
load 3
itxn_field XferAsset
global CurrentApplicationAddress
load 3
asset_holding_get AssetBalance
pop
itxn_field AssetAmount
txn Sender
itxn_field AssetReceiver

b finish_send_back


swapped_for_algos:

int pay
itxn_field TypeEnum
global CurrentApplicationAddress
balance
global CurrentApplicationAddress
min_balance
-
// balance - min balance
itxn_field Amount
txn Sender
itxn_field Receiver


finish_send_back:
int 0
itxn_field Fee

itxn_submit

`