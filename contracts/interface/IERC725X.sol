// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.11;

interface IERC725X
{
  event ContractCreated(address indexed addr);
  event Executed(uint256 indexed operation, address indexed to, uint256 indexed value, bytes data);

  function execute(uint256 operation, address to, uint256 value, bytes memory data) external payable;
}
