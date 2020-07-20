// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.11;

// ref. ERC1155 https://eips.ethereum.org/EIPS/eip-1155
interface ERC1155TokenReceiver
{
  function onERC1155Received(
    address operator,
    address from,
    uint256 id,
    uint256 value,
    bytes calldata data
  ) external returns(bytes4);

  function onERC1155BatchReceived(
    address operator,
    address from,
    uint256[] calldata ids,
    uint256[] calldata values,
    bytes calldata data
  ) external returns(bytes4);
}
