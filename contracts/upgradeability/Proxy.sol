// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.11;

contract Proxy
{
  /*
   * ref. EIP1967 https://eips.ethereum.org/EIPS/eip-1967
   * obtained as bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
   */
  bytes32 internal constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

  event Received(address indexed sender, uint256 value, bytes data);

  constructor(address impl) public payable
  {
    bytes32 slot = IMPLEMENTATION_SLOT;

    assembly {
      sstore(slot, impl)
    }
  }

  function implementation() public view returns(address impl)
  {
    bytes32 slot = IMPLEMENTATION_SLOT;

    assembly {
      impl := sload(slot)
    }
  }

  fallback() external payable
  {
    address impl = implementation();

    assembly {
      calldatacopy(0, 0, calldatasize())
      let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
      returndatacopy(0, 0, returndatasize())
      switch result
      case 0 { revert(0, returndatasize()) }
      default { return(0, returndatasize()) }
    }
  }

  receive() external payable
  {
    emit Received(msg.sender, msg.value, msg.data);
  }
}
