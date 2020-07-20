// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.11;

import "./interface/IERC165.sol";

contract InterfaceChecker is ERC165
{
  function supportsInterface(bytes4 interfaceID) external view override returns (bool)
  {
    return
      interfaceID == 0x01ffc9a7 || // ERC165: bytes4(keccak256("supportsInterface(bytes4)"))
      interfaceID == 0x4e2312e0;   // ERC1155: bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)")) ^ bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))
  }
}
