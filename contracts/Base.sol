// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract Base is ERC721Holder, ERC1155Holder {
    address private _owner;

    event OwnershipTransferred(
        address indexed prevOwner,
        address indexed newOwner
    );

    modifier onlyOwner {
        require(_isOwner(msg.sender), "must be owner");
        _;
    }

    modifier onlyOwnerOrSelf {
        require(
            _isOwner(msg.sender) || _isSelf(msg.sender),
            "must be owner or self"
        );
        _;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function transferOwnership(address newOwner) external onlyOwnerOrSelf {
        require(newOwner != address(0), "new owner cannot be the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }

    function _setInitialOwner(address initOwner) internal {
        require(_owner == address(0), "already initialized");
        _owner = initOwner;
        emit OwnershipTransferred(address(0), initOwner);
    }

    function _isOwner(address addr) internal view returns (bool) {
        return addr == _owner;
    }

    function _isSelf(address addr) internal view returns (bool) {
        return addr == address(this);
    }
}
