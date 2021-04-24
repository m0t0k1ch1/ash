// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract ProxyFactory {
    event ProxyCreated(address indexed proxy);

    function createProxy(
        address impl,
        address admin,
        bytes memory data,
        bytes32 salt
    ) public {
        address proxy =
            address(
                new TransparentUpgradeableProxy{salt: salt}(impl, admin, data)
            );

        emit ProxyCreated(proxy);
    }
}
