export const algofiFee = (result) => {
  let fee = 10;
  if (result["validator_index"] == 0) {
    fee = 30; // it should be 25 but for an unknown reason the testnet usdc - algo pool charges 0.3% instead of 0.25%
  } else if (result["validator_index"] == 1) {
    fee = 75;
  }
  return fee;
};
