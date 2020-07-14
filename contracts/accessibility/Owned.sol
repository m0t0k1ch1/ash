// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.11;

contract Owned
{
  address public owner;

  event OwnerChanged(address indexed newOwner);

  modifier onlyOwner
  {
    require(msg.sender == owner, "must be owner");
    _;
  }

  function initializeOwner(address initOwner) public
  {
    require(owner == address(0), "already initialized");
    owner = initOwner;
    emit OwnerChanged(initOwner);
  }

  function changeOwner(address newOwner) public onlyOwner
  {
    require(newOwner != address(0), "address must not be null");
    owner = newOwner;
    emit OwnerChanged(newOwner);
  }
}
