// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.10;

contract Owned
{
  address public owner;

  event OwnerChanged(address indexed newOwner);

  modifier onlyOwner
  {
    require(msg.sender == owner, "must be owner");
    _;
  }

  constructor() public
  {
    owner = msg.sender;
  }

  function changeOwner(address newOwner) external onlyOwner
  {
    require(newOwner != address(0), "address must not be null");
    owner = newOwner;
    emit OwnerChanged(newOwner);
  }
}
