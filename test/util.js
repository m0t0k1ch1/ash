exports.bn = (s) => {
  return ethers.BigNumber.from(s);
};

exports.getSigHashBytes = (
  chainID,
  account,
  to,
  value,
  data,
  nonce,
  gasToken,
  gasPrice,
  gasLimit,
  gasOverhead,
  gasReceiver
) => {
  return ethers.utils.arrayify(
    ethers.utils.keccak256(
      ethers.utils.solidityPack(
        [
          "bytes1",
          "bytes1",
          "uint256",
          "address",
          "address",
          "uint256",
          "bytes",
          "uint256",
          "address",
          "uint256",
          "uint256",
          "uint256",
          "address",
        ],
        [
          0x19,
          0x00,
          chainID,
          account,
          to,
          value,
          data,
          nonce,
          gasToken,
          gasPrice,
          gasLimit,
          gasOverhead,
          gasReceiver,
        ]
      )
    )
  );
};
