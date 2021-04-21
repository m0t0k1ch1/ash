// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./Base.sol";

contract Account is Base {
    using ECDSA for bytes32;

    uint256 private _nonce;

    event Executed(address indexed target, uint256 value, bytes data);

    constructor() {}

    function nonce() public view returns (uint256) {
        return _nonce;
    }

    function init(address owner) external {
        _setInitialOwner(owner);
        _nonce = 0;
    }

    function execute(
        address to,
        uint256 value,
        bytes calldata data,
        bytes calldata sig
    ) external returns (bytes memory) {
        bytes32 sigHash = _getSigHash(to, value, data);
        address signer = sigHash.toEthSignedMessageHash().recover(sig);
        require(signer == owner(), "invalid signature");

        _nonce++;

        return _execute(to, value, data);
    }

    function _execute(
        address to,
        uint256 value,
        bytes memory data
    ) internal returns (bytes memory) {
        (bool success, bytes memory result) = to.call{value: value}(data);
        if (!success) {
            assembly {
                returndatacopy(0, 0, returndatasize())
                revert(0, returndatasize())
            }
        }
        emit Executed(to, value, data);

        return result;
    }

    function _getSigHash(
        address to,
        uint256 value,
        bytes memory data
    ) internal view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    bytes1(0x19),
                    bytes1(0),
                    address(this),
                    block.chainid,
                    to,
                    value,
                    data,
                    _nonce
                )
            );
    }
}
