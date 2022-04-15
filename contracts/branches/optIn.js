export const optIn = `

// The app will now opt-in all the relevant assets in a loop

loop:

itxn_begin

load 11 // will be 0 on first load
txnas Assets
itxn_field XferAsset
// the rest of fields are common to all inner optin tx
callsub optin_commonFields

itxn_submit

load 11 
int 1
+
dup
store 11
txn NumAssets
<
bnz loop

b allow


////////////////////// subroutines

optin_commonFields:

// opt-in is an asset transfer
int axfer
itxn_field TypeEnum

// transfer amount is 0 for opt-in
int 0
itxn_field AssetAmount

// Sender is the app
global CurrentApplicationAddress
itxn_field Sender

// Since the sender is the app, let's set the Fee to 0
int 0
itxn_field Fee

// Receiver is the app
global CurrentApplicationAddress
itxn_field AssetReceiver

retsub

`
