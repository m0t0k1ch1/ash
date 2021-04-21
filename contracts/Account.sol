// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.3;

import "./TokenReceiver.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Account is TokenReceiver {
    using ECDSA for bytes32;

    address public owner;
    uint256 public nonce;

    event Executed(address indexed target, uint256 value, bytes data);

    event OwnershipTransferred(
        address indexed prevOwner,
        address indexed newOwner
    );

    modifier onlyOwner {
        require(msg.sender == owner, "must be owner");
        _;
    }

    function init(address initOwner) external {
        require(owner == address(0), "already initialized");
        emit OwnershipTransferred(address(0), initOwner);
        owner = initOwner;
        nonce = 0;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "address must not be null");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function executeMetaTx(
        address to,
        uint256 value,
        bytes calldata data,
        bytes calldata sig
    ) external returns (bytes memory) {
        bytes32 sigHash = getSigHash(to, value, data);
        address signer = sigHash.toEthSignedMessageHash().recover(sig);
        require(signer == owner, "invalid signature");

        nonce++;

        return execute(to, value, data);
    }

    function execute(
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

    function getSigHash(
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
                    nonce
                )
            );
    }
}
