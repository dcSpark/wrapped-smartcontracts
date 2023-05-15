import algosdk from "algosdk";

export const algSign = (payload: Buffer, privateKey: Uint8Array, l1Address: string) => {
  const tx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: l1Address,
    to: l1Address,
    amount: 0,
    note: new Uint8Array(payload),
    suggestedParams: {
      fee: 0,
      flatFee: true,
      firstRound: 1,
      lastRound: 1,
      genesisID: "",
      genesisHash: "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8",
    },
  });

  const signedTx = algosdk.signTransaction(tx, privateKey);

  return {
    signature: signedTx.blob,
    key: tx.from.publicKey,
  };
};
