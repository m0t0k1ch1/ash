// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.10;

import "../accessibility/Owned.sol";
import "../interface/IERC725X.sol";

contract Proxy is Owned, IERC725X
{
  function execute(uint256 operation, address to, uint256 value, bytes memory data) external payable override onlyOwner {}
}
