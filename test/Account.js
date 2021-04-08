const { expect } = require("chai");

describe("Account contract", () => {
  let Account;

  let account;

  let owner;
  let other;

  beforeEach(async () => {
    Account = await ethers.getContractFactory("Account");

    account = await Account.deploy();

    [owner, other] = await ethers.getSigners();
  });

  describe("deployment", () => {
    it("initial state", async () => {
      expect(await account.owner()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe("tx", () => {
    it("supportsInterface", async () => {
      expect(await account.supportsInterface("0x01ffc9a7")).to.be.true; // ERC165
      expect(await account.supportsInterface("0x4e2312e0")).to.be.true; // ERC1155Receiver
    });

    it("onERC1155Received", async () => {
      expect(
        await account.onERC1155Received(
          ethers.constants.AddressZero,
          ethers.constants.AddressZero,
          0,
          0,
          []
        )
      ).to.equal("0xf23a6e61"); // bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))
    });

    it("onERC1155BatchReceived", async () => {
      expect(
        await account.onERC1155BatchReceived(
          ethers.constants.AddressZero,
          ethers.constants.AddressZero,
          [],
          [],
          []
        )
      ).to.equal("0xbc197c81"); // bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))
    });

    it("init", async () => {
      expect(await account.init(owner.address))
        .to.emit(account, "OwnershipTransferred")
        .withArgs(ethers.constants.AddressZero, owner.address);
      expect(await account.owner()).to.equal(owner.address);

      await expect(account.init(owner.address)).to.be.revertedWith(
        "already initialized"
      );
    });

    it("transferOwnership", async () => {
      await account.init(owner.address);

      await expect(
        account.connect(other).transferOwnership(other.address)
      ).to.be.revertedWith("must be owner");

      expect(await account.transferOwnership(other.address))
        .to.emit(account, "OwnershipTransferred")
        .withArgs(owner.address, other.address);
      expect(await account.owner()).to.equal(other.address);
    });

    it("execute", async () => {
      // TODO
    });
  });
});
