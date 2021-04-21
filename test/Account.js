const { expect } = require("chai");

describe("Account contract", () => {
  let Account;
  let account;

  let AshToken;
  let ashToken;

  let owner;
  let other;

  beforeEach(async () => {
    Account = await ethers.getContractFactory("Account");
    account = await Account.deploy();

    AshToken = await ethers.getContractFactory("AshToken");
    ashToken = await AshToken.deploy();

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

    it("executeMetaTx", async () => {
      await account.init(owner.address);
      await ashToken.transfer(
        account.address,
        await ashToken.balanceOf(owner.address)
      );

      const accountBalanceBefore = await ashToken.balanceOf(account.address);
      const otherBalanceBefore = await ashToken.balanceOf(other.address);
      const transferAmount = 1;

      const to = ashToken.address;
      const value = 0;
      const data = ashToken.interface.encodeFunctionData("transfer", [
        other.address,
        transferAmount,
      ]);

      const sigHashBytes = ethers.utils.arrayify(
        ethers.utils.keccak256(
          ethers.utils.solidityPack(
            [
              "bytes1",
              "bytes1",
              "address",
              "uint256",
              "address",
              "uint256",
              "bytes",
              "uint256",
            ],
            [
              0x19,
              0x00,
              account.address,
              (await ethers.provider.getNetwork()).chainId,
              to,
              value,
              data,
              await account.nonce(),
            ]
          )
        )
      );

      await expect(
        account.executeMetaTx(
          to,
          value,
          data,
          await other.signMessage(sigHashBytes)
        )
      ).to.be.revertedWith("invalid signature");

      expect(
        await account.executeMetaTx(
          to,
          value,
          data,
          await owner.signMessage(sigHashBytes)
        )
      )
        .to.emit(account, "Executed")
        .withArgs(to, value, data);

      const accountBalanceAfter = await ashToken.balanceOf(account.address);
      const otherBalanceAfter = await ashToken.balanceOf(other.address);

      expect(accountBalanceAfter.sub(accountBalanceBefore)).to.equal(
        -transferAmount
      );
      expect(otherBalanceAfter.sub(otherBalanceBefore)).to.equal(
        transferAmount
      );
    });
  });
});
