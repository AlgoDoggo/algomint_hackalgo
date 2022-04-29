export const algofiSwap = `
itxn_begin

load 1 // ID of asset-out
bz algofi_swap_algos

int axfer
itxn_field TypeEnum
load 1 
itxn_field XferAsset
load 2 // amount of asset-in
itxn_field AssetAmount
txna Accounts 1 // algofi pool
itxn_field AssetReceiver

b finish_algofi_swap

algofi_swap_algos:

int pay
itxn_field TypeEnum
load 2 // amount of asset-in
itxn_field Amount
txna Accounts 1 // algofi pool
itxn_field Receiver

finish_algofi_swap:
int 0
itxn_field Fee

itxn_next

int appl
itxn_field TypeEnum
global MinTxnFee
int 0 // appl fee is 2x 
*
itxn_field Fee
txna Applications 1
itxn_field ApplicationID
byte "sef"
itxn_field ApplicationArgs
txna ApplicationArgs 0 // min amount out
itxn_field ApplicationArgs
load 3
itxn_field Assets // algofi foreignAssets array, asset out only
txna Applications 3 // algofi_manager_app
itxn_field Applications

itxn_submit

b send_asset_to_user
`