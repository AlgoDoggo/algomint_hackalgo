export const tinySwap = `
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
`