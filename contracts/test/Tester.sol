// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.11;

contract Tester
{
  mapping(address => uint256) public values;

  function setValue(uint256 value) public
  {
    values[msg.sender] = value;
  }
}
