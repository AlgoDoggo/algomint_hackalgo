export const algofiQuoteTeal = `

// check price on Algofi
// Let's fetch the pool supply

// get asset-in supply
int 2 // the algofi app is at index 2
txnas Applications
dup // leave one on stack for next paragraph
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
// application still on stack
byte "b1"
byte "b2"
load 3
load 1
>
select
app_global_get_ex
pop
store 8

//swapInAmountLessFees = swapInAmount - (Math.floor(swapInAmount * swapFee) + 1)
load 2
dup
txna ApplicationArgs 1 // algofi pools have 3 types of fee, 10 (0.1%), 25 (0.25%) or 75 (0.75%)
btoi
*
int 10000
/
int 1
+
- // swapInAmountLessFees
dup
// amount_out = (assetOutSupply * swapInAmountLessFees) / (assetInSupply + swapInAmountLessFees)

load 8
mulw
load 7
uncover 3 
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