export const pactfiSwap = `
itxn_begin

load 1 // ID of asset-out
bz pact_swap_algos

int axfer
itxn_field TypeEnum
load 1 
itxn_field XferAsset
load 2 // amount of asset-in
itxn_field AssetAmount
txna Accounts 2 // pact pool
itxn_field AssetReceiver

b finish_pact_swap

pact_swap_algos:

int pay
itxn_field TypeEnum
load 2 // amount of asset-in
itxn_field Amount
txna Accounts 2 // pact pool
itxn_field Receiver

finish_pact_swap:
int 0
itxn_field Fee

itxn_next

int appl
itxn_field TypeEnum
global MinTxnFee
int 0 // appl fee is 2x 
*
itxn_field Fee
txna Applications 2
itxn_field ApplicationID
byte "SWAP"
itxn_field ApplicationArgs
txna ApplicationArgs 0 // min amount out
itxn_field ApplicationArgs
load 1
load 3 // for the id of asset-out this was evaluated in the previous app call
dup2
>
select // Pactfi foreignAssets array, smaller asset first
itxn_field Assets
load 1
load 3
dup2
<
select // then is the bigger asset
itxn_field Assets

itxn_submit

b send_asset_to_user
`