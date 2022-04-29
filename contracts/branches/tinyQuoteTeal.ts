export const tinyQuoteTeal = `

// check price on Tinyman
// first let's fetch the pool supply amounts and substract the redeem amounts in pool local state

txna Accounts 1 // if the zero address is sent in accounts array, it means there is no pool for that asset pair
global ZeroAddress
==
bnz tiny_log_quote

// get asset-in balance in tiny pool
load 1
bz tiny_assetIn_isAlgo

txna Accounts 1
load 1
asset_holding_get AssetBalance
pop // remove opt-in info
// balance

b tiny_assetIn_getOutstanding

tiny_assetIn_isAlgo:
txna Accounts 1
balance // algo balance


tiny_assetIn_getOutstanding:
// get outstanding algo balance in tiny pool
txna Accounts 1
txna Applications 1 // tinyman validator app
byte "o"
load 1
itob
concat
app_local_get_ex
pop
// outstanding amount
-
store 4 // asset1 supply Tiny pool


load 3
bz tiny_assetOut_isAlgo

// get asset-out balance in tiny pool
txna Accounts 1
load 3
asset_holding_get AssetBalance
pop // remove opt-in info
// balance 

b tiny_assetOut_getOutstanding

tiny_assetOut_isAlgo:
txna Accounts 1
balance // algo balance

tiny_assetOut_getOutstanding:
// get outstanding amount in tiny pool local state
txna Accounts 1
txna Applications 1
byte "o"
load 3
itob
concat
app_local_get_ex
pop
// outstanding amount
-
store 5 // asset1 supply Tiny pool

// amount_out = (asset_in_amount * 997 * asset_out_supply) / ((asset_in_supply * 1000) + (asset_in_amount * 997))
load 2
int 997
*
load 5
mulw
load 4
int 1000
*
load 2
int 997
*
addw
divmodw
pop
pop
swap
pop
store 6 // Asset-out amount with Tinyman

tiny_log_quote:
load 6 // 0 if we landed there from the bnz at the top
itob
byte "Tinyman"
log
log


`