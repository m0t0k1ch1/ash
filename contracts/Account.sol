// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.11;

contract Account
{
  /*
   * ref. EIP1967 https://eips.ethereum.org/EIPS/eip-1967
   * obtained as bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
   */
  bytes32 internal constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

  bool public initialized = false;
  address public owner;

  event OwnerChanged(address indexed newOwner);
  event Executed(address indexed dest, uint256 value, bytes data);
  event Updated(address indexed impl);

  modifier onlyOwner
  {
    require(msg.sender == owner, "must be owner");
    _;
  }

  modifier onlySelf
  {
    require(msg.sender == address(this), "must be self");
    _;
  }

  function implementation() public view returns (address impl)
  {
    bytes32 slot = IMPLEMENTATION_SLOT;

    assembly {
      impl := sload(slot)
    }
  }

  function initialize(address initOwner) public
  {
    require(!initialized, "already initialized");
    owner = initOwner;
    initialized = true;
  }

  function changeOwner(address newOwner) public onlyOwner
  {
    require(newOwner != address(0), "address must not be null");
    owner = newOwner;
    emit OwnerChanged(newOwner);
  }

  function execute(address dest, uint256 value, bytes calldata data) public onlyOwner returns (bytes memory)
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
}
