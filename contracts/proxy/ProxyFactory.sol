// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract ProxyFactory {
    event ProxyCreated(address indexed proxy);

    function createProxy(
        address impl,
        bytes32 salt,
        bytes memory data
    ) public {
        address payable proxy =
            payable(new ERC1967Proxy{salt: salt}(impl, data));

        emit ProxyCreated(proxy);
    }
}
