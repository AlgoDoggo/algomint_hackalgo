export const tinyQuoteTeal = `

// check price on Tinyman
// first let's fetch the pool amounts and substract the redeem amounts in pool local state

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
// get outsanding algo balance in tiny pool
txna Accounts 1
int ${tinyValidatorApp}
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
int ${tinyValidatorApp}
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
997
*
load 5
mulw
load 4
1000
*
load 2
997
*
addw
divw
store 6

`