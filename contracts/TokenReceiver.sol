// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.11;

import "./interface/IERC1155TokenReceiver.sol";

contract TokenReceiver is ERC1155TokenReceiver
{
  function onERC1155Received(address, address, uint256, uint256, bytes calldata) external override returns (bytes4)
  {
    return this.onERC1155Received.selector;
  }

  function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata) external override returns (bytes4)
  {
    return this.onERC1155BatchReceived.selector;
  }
}
