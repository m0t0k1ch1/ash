// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.3;

import "./TokenReceiver.sol";

contract Account is TokenReceiver {
    address public owner;

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
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "address must not be null");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function execute(
        address target,
        uint256 value,
        bytes memory data
    ) external onlyOwner returns (bytes memory) {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                returndatacopy(0, 0, returndatasize())
                revert(0, returndatasize())
            }
        }
        emit Executed(target, value, data);

        return result;
    }
}
