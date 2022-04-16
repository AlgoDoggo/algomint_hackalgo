export const algofiQuoteTeal = `

// check price on Algofi
// Let's fetch the pool supply

// get asset-in supply
txna Applications 2
byte "b1"
byte "b2"
load 1
load 3
>
select
app_global_get_ex
pop
store 7

// get asset-out supply
txna Applications 2
byte "b1"
byte "b2"
load 3
load 1
>
select
app_global_get_ex
pop
store 8


// algofi pools have 2 types of fee 75 or 25, I'm sending it in appargs
int 10000
txna ApplicationArgs 1
btoi
-
dup
store 10

// amount_out = (asset_in_amount * (9925 || 9975) * asset_out_supply) / ((asset_in_supply * 10000) + (asset_in_amount * (9925 || 9975)))
load 2
*
load 8
mulw
load 7
int 10000
*
load 2
load 10
*
addw
divmodw
pop
pop
swap
pop
dup
store 9 // Asset-out amount with Algofi
itob
byte "Algofi"
log
log

`