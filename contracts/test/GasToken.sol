// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GasToken is ERC20 {
    constructor() ERC20("GasToken", "GAS") {
        _mint(msg.sender, 21000000 * 10**18);
    }
}
