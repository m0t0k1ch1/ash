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

    it("onERC721Received", async () => {
      await account.onERC721Received(
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        0,
        []
      );
    });

    it("onERC1155Received", async () => {
      await account.onERC1155Received(
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        0,
        0,
        []
      );
    });

    it("onERC1155BatchReceived", async () => {
      await account.onERC1155BatchReceived(
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        [],
        [],
        []
      );
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

    it("execute: transfer ownership to the other", async () => {
      await account.init(owner.address);

      const nonceBefore = await account.nonce();

      const chainID = (await ethers.provider.getNetwork()).chainId;
      const to = account.address;
      const value = 0;
      const data = account.interface.encodeFunctionData("transferOwnership", [
        other.address,
      ]);
      const nonce = await account.nonce();

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
            [0x19, 0x00, account.address, chainID, to, value, data, nonce]
          )
        )
      );

      await expect(
        account.execute(to, value, data, await other.signMessage(sigHashBytes))
      ).to.be.revertedWith("invalid signature");

      expect(
        await account.execute(
          to,
          value,
          data,
          await owner.signMessage(sigHashBytes)
        )
      )
        .to.emit(account, "Executed")
        .withArgs(to, value, data);
      expect(await account.nonce()).to.equal(nonceBefore.add(1));
      expect(await account.owner()).to.equal(other.address);
    });

    it("execute: transfer ownership to the zero address", async () => {
      await account.init(owner.address);

      const chainID = (await ethers.provider.getNetwork()).chainId;
      const to = account.address;
      const value = 0;
      const data = account.interface.encodeFunctionData("transferOwnership", [
        ethers.constants.AddressZero,
      ]);
      const nonce = await account.nonce();

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
            [0x19, 0x00, account.address, chainID, to, value, data, nonce]
          )
        )
      );

      await expect(
        account.execute(to, value, data, await owner.signMessage(sigHashBytes))
      ).to.be.revertedWith("new owner cannot be the zero address");
    });
  });
});
