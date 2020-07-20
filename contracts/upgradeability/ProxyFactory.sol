// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.11;

import "./Proxy.sol";

contract ProxyFactory
{
  event ProxyCreated(address indexed proxy);

  function createProxy(address impl, uint256 salt, bytes memory initData) public
  {
    address proxy;
    bytes memory code = abi.encodePacked(type(Proxy).creationCode, uint256(impl));

    // solium-disable-next-line security/no-inline-assembly
    assembly {
      proxy := create2(0, add(code, 0x20), mload(code), salt)
      if iszero(extcodesize(proxy)) {
        revert(0, 0)
      }
    }

    // solium-disable-next-line security/no-low-level-calls
    (bool success,) = proxy.call(initData);
    if (!success) {
      // solium-disable-next-line security/no-inline-assembly
      assembly {
        returndatacopy(0, 0, returndatasize())
        revert(0, returndatasize())
      }
    }

    emit ProxyCreated(proxy);
  }
}
