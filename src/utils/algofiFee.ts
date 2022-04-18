export const algofiFee = (result) => {
  let fee = 10;
  if (result["validator_index"] == 0) {
    fee = 25;
  } else if (result["validator_index"] == 1) {
    fee = 75;
  }
  return fee;
};
