// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.11;

import "@openzeppelin/contracts/introspection/ERC165.sol";
import "./TokenReceiver.sol";

contract Account is ERC165, TokenReceiver
{
  address public owner;

  bool private _initialized = false;

  event Executed(address indexed dest, uint256 value, bytes data);
  event OwnershipTransferred(address indexed prevOwner, address indexed newOwner);

  modifier onlyOwner
  {
    require(msg.sender == owner, "must be owner");
    _;
  }

  modifier onlyOwnerOrSelf
  {
    require(msg.sender == owner || msg.sender == address(this), "must be owner or self");
    _;
  }

  function initialize(address initOwner) public
  {
    require(!_initialized, "already initialized");
    _initialized = true;

    owner = initOwner;
    emit OwnershipTransferred(address(0), initOwner);

    _registerInterfaces();
  }

  function execute(address dest, uint256 value, bytes memory data) public onlyOwner returns(bytes memory)
  {
    (bool success, bytes memory result) = dest.call{ value: value }(data);
    if (!success) {
      assembly {
        returndatacopy(0, 0, returndatasize())
        revert(0, returndatasize())
      }
    }

    emit Executed(dest, value, data);

    return result;
  }

  function transferOwnership(address newOwner) public onlyOwnerOrSelf
  {
    require(newOwner != address(0), "address must not be null");
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

  function _registerInterfaces() private
  {
    // ERC1155TokenReceiver: bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)")) ^ bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))
    _registerInterface(0x4e2312e0);
  }
}
