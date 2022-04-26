export const pactfiQuote = `

// check price on Patcfi
// Let's fetch the pool supply

txna Accounts 3 // if the zero address is sent in accounts array, it means there is no pool for that asset pair
global ZeroAddress
==
bnz pact_log_quote

// get asset-in supply
txna Applications 3
byte "A" // in pactfi A is the primary asset and A < B
byte "B"
load 1 // asset-in
load 3 // asset-out
>
select
app_global_get_ex
pop
store 12

// get asset-out supply
txna Applications 3
byte "A"
byte "B"
load 3
load 1
>
select
app_global_get_ex
pop
store 13

// Pactfi pools have many fee tiers, the most common one is 30 or 0.3%
int 10000
txna ApplicationArgs 2
btoi
-
dup
store 15 // 10000 - 30 = 9970

// amount_out = (asset_in_amount * (9970) * asset_out_supply) / ((asset_in_supply * 10000) + (asset_in_amount * (9970)))
load 2
*
load 13
mulw
load 12
int 10000
*
load 2
load 15
*
addw
divmodw
pop
pop
swap
pop
store 14 // Asset-out amount with Pactfi

pact_log_quote:
load 14 // Will be 0 in an absence of pool
itob
byte "Pactfi"
log
log

`