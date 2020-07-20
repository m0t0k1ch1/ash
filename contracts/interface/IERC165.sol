// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.11;

// ref. ERC165 https://eips.ethereum.org/EIPS/eip-165
interface ERC165
{
  function supportsInterface(bytes4 interfaceID) external view returns (bool);
}
