export const sendAsset = `

// Send back the result of the successful swap (Pactfi && Algofi)

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

`