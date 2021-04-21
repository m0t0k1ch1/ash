// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AshToken is ERC20 {
    constructor() ERC20("AshToken", "ASH") {
        _mint(msg.sender, 21000000 * 10**18);
    }
}
