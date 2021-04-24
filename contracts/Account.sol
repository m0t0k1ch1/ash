// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

import "./Base.sol";

contract Account is Base {
    using ECDSA for bytes32;

    uint256 private _nonce;

    event Executed(address indexed target, uint256 value, bytes data);
    event Refunded(address indexed receiver, address token, uint256 amount);

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
        bytes calldata data
    ) external onlyOwner returns (bytes memory) {
        return _execute(to, value, data);
    }

    function executeMetaTx(
        address to,
        uint256 value,
        bytes calldata data,
        address gasToken,
        uint256 gasPrice,
        uint256 gasLimit,
        uint256 gasOverhead,
        address gasReceiver,
        bytes calldata sig
    ) external returns (bytes memory) {
        uint256 gasInit = gasleft();

        {
            bytes32 sigHash =
                _getSigHash(
                    to,
                    value,
                    data,
                    gasToken,
                    gasPrice,
                    gasLimit,
                    gasOverhead,
                    gasReceiver
                );
            address signer = sigHash.recover(sig);
            require(signer == owner(), "invalid signature");
        }

        _nonce++;

        bytes memory result = _execute(to, 0, data);

        _refund(
            gasInit,
            gasToken,
            gasPrice,
            gasLimit,
            gasOverhead,
            gasReceiver
        );

        return result;
    }

    function _getSigHash(
        address to,
        uint256 value,
        bytes memory data,
        address gasToken,
        uint256 gasPrice,
        uint256 gasLimit,
        uint256 gasOverhead,
        address gasReceiver
    ) internal view returns (bytes32) {
        bytes memory message =
            abi.encodePacked(
                _getSigMessage(to, value, data),
                _getSigMessage(
                    gasToken,
                    gasPrice,
                    gasLimit,
                    gasOverhead,
                    gasReceiver
                )
            );

        return keccak256(message).toEthSignedMessageHash();
    }

    function _getSigMessage(
        address to,
        uint256 value,
        bytes memory data
    ) internal view returns (bytes memory) {
        return
            abi.encodePacked(
                bytes1(0x19),
                bytes1(0),
                block.chainid,
                address(this),
                to,
                value,
                data,
                _nonce
            );
    }

    function _getSigMessage(
        address gasToken,
        uint256 gasPrice,
        uint256 gasLimit,
        uint256 gasOverhead,
        address gasReceiver
    ) internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                gasToken,
                gasPrice,
                gasLimit,
                gasOverhead,
                gasReceiver
            );
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

    function _refund(
        uint256 gasInit,
        address gasToken,
        uint256 gasPrice,
        uint256 gasLimit,
        uint256 gasOverhead,
        address gasReceiver
    ) internal {
        if (gasPrice > 0) {
            gasReceiver = gasReceiver == address(0) ? msg.sender : gasReceiver;
            uint256 gasConsumed = gasInit - gasleft() + gasOverhead;
            uint256 refundAmount = Math.min(gasConsumed, gasLimit) * gasPrice;
            IERC20(gasToken).transfer(gasReceiver, refundAmount);
            emit Refunded(gasReceiver, gasToken, refundAmount);
        }
    }
}
