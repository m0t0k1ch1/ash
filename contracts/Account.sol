// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.11;

import "@openzeppelin/contracts/introspection/ERC165.sol";
import "./accessibility/Owned.sol";
import "./TokenReceiver.sol";

contract Account is ERC165, Owned, TokenReceiver
{
  /*
   * ref. EIP1967 https://eips.ethereum.org/EIPS/eip-1967
   * obtained as bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
   */
  bytes32 internal constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

  bool internal initialized = false;

  event Executed(address indexed dest, uint256 value, bytes data);
  event Updated(address indexed impl);

  modifier onlySelf
  {
    require(msg.sender == address(this), "must be self");
    _;
  }

  function initialize(address owner) public
  {
    require(!initialized, "already initialized");
    initialized = true;

    initializeOwner(owner);
    registerInterfaces();
  }

  function implementation() public view returns(address impl)
  {
    bytes32 slot = IMPLEMENTATION_SLOT;

    assembly {
      impl := sload(slot)
    }
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

  function update(address impl) public onlySelf
  {
    bytes32 slot = IMPLEMENTATION_SLOT;

    assembly {
      sstore(slot, impl)
    }

    emit Updated(impl);
  }

  function registerInterfaces() internal
  {
    // ERC1155TokenReceiver: bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)")) ^ bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))
    _registerInterface(0x4e2312e0);
  }
}
