const { expect } = require("chai");

const { bn, getSigHashBytes } = require("./util");

describe("Account contract", () => {
  let chainID;

  let Account;
  let account;

  let GasToken;
  let gasToken;

  let owner;
  let other;

  beforeEach(async () => {
    chainID = (await ethers.provider.getNetwork()).chainId;

    Account = await ethers.getContractFactory("Account");
    account = await Account.deploy();

    GasToken = await ethers.getContractFactory("GasToken");
    gasToken = await GasToken.deploy();

    [owner, other, relayer, gasReceiver] = await ethers.getSigners();
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

    it("transferOwnership: failure", async () => {
      await account.init(owner.address);

      await expect(
        account.connect(other).transferOwnership(other.address)
      ).to.be.revertedWith("must be owner or self");
    });

    it("transferOwnership: success", async () => {
      await account.init(owner.address);

      expect(await account.transferOwnership(other.address))
        .to.emit(account, "OwnershipTransferred")
        .withArgs(owner.address, other.address);
      expect(await account.owner()).to.equal(other.address);
    });

    it("execute: failure: not owner", async () => {
      await account.init(owner.address);

      const to = account.address;
      const value = bn(0);
      const data = account.interface.encodeFunctionData("transferOwnership", [
        other.address,
      ]);

      await expect(
        account.connect(other).execute(to, value, data)
      ).to.be.revertedWith("must be owner");
    });

    it("execute: failure: invalid external call", async () => {
      await account.init(owner.address);

      const to = account.address;
      const value = bn(0);
      const data = account.interface.encodeFunctionData("transferOwnership", [
        ethers.constants.AddressZero,
      ]);

      await expect(account.execute(to, value, data)).to.be.revertedWith(
        "new owner cannot be the zero address"
      );
    });

    it("execute: success", async () => {
      await account.init(owner.address);

      const to = account.address;
      const value = bn(0);
      const data = account.interface.encodeFunctionData("transferOwnership", [
        other.address,
      ]);

      expect(await account.execute(to, value, data))
        .to.emit(account, "Executed")
        .withArgs(to, value, data);
      expect(await account.owner()).to.equal(other.address);
    });

    it("executeMetaTx: failure: invalid signature", async () => {
      await account.init(owner.address);

      const to = account.address;
      const value = bn(0);
      const data = account.interface.encodeFunctionData("transferOwnership", [
        other.address,
      ]);
      const nonce = await account.nonce();

      const sigHashBytes = getSigHashBytes(
        chainID,
        account.address,
        to,
        value,
        data,
        nonce,
        gasToken.address,
        0,
        0,
        0,
        gasReceiver.address
      );
      const sig = await other.signMessage(sigHashBytes);

      await expect(
        account
          .connect(relayer)
          .executeMetaTx(
            to,
            value,
            data,
            gasToken.address,
            0,
            0,
            0,
            gasReceiver.address,
            sig
          )
      ).to.be.revertedWith("invalid signature");
    });

    it("executeMetaTx: success (without refund)", async () => {
      await account.init(owner.address);

      const nonceBefore = await account.nonce();

      const to = account.address;
      const value = bn(0);
      const data = account.interface.encodeFunctionData("transferOwnership", [
        other.address,
      ]);
      const nonce = await account.nonce();

      const sigHashBytes = getSigHashBytes(
        chainID,
        account.address,
        to,
        value,
        data,
        nonce,
        gasToken.address,
        0,
        0,
        0,
        gasReceiver.address
      );
      const sig = await owner.signMessage(sigHashBytes);

      expect(
        await account
          .connect(relayer)
          .executeMetaTx(
            to,
            value,
            data,
            gasToken.address,
            0,
            0,
            0,
            gasReceiver.address,
            sig
          )
      )
        .to.emit(account, "Executed")
        .withArgs(to, value, data);
      expect(await account.nonce()).to.equal(nonceBefore.add(1));
      expect(await account.owner()).to.equal(other.address);
    });

    it("executeMetaTx: failure (with refund): insufficient gas token", async () => {
      await account.init(owner.address);

      const to = account.address;
      const value = bn(0);
      const data = account.interface.encodeFunctionData("transferOwnership", [
        other.address,
      ]);
      const nonce = await account.nonce();

      const gasPrice = bn(10);
      const gasLimit = bn(100000);
      const gasOverhead = bn(50000);

      const sigHashBytes = getSigHashBytes(
        chainID,
        account.address,
        to,
        value,
        data,
        nonce,
        gasToken.address,
        gasPrice,
        gasLimit,
        gasOverhead,
        gasReceiver.address
      );
      const sig = await owner.signMessage(sigHashBytes);

      await expect(
        account
          .connect(relayer)
          .executeMetaTx(
            to,
            value,
            data,
            gasToken.address,
            gasPrice,
            gasLimit,
            gasOverhead,
            gasReceiver.address,
            sig
          )
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("executeMetaTx: success (with refund)", async () => {
      await account.init(owner.address);

      const accountGasTokenBalanceBefore = bn(1000000);
      await gasToken.transfer(account.address, accountGasTokenBalanceBefore);

      const nonceBefore = await account.nonce();

      const to = account.address;
      const value = bn(0);
      const data = account.interface.encodeFunctionData("transferOwnership", [
        other.address,
      ]);
      const nonce = await account.nonce();

      const gasPrice = bn(10);
      const gasLimit = bn(100000);
      const gasOverhead = bn(50000);

      const sigHashBytes = getSigHashBytes(
        chainID,
        account.address,
        to,
        value,
        data,
        nonce,
        gasToken.address,
        gasPrice,
        gasLimit,
        gasOverhead,
        gasReceiver.address
      );
      const sig = await owner.signMessage(sigHashBytes);

      const tx = await account
        .connect(relayer)
        .executeMetaTx(
          to,
          value,
          data,
          gasToken.address,
          gasPrice,
          gasLimit,
          gasOverhead,
          gasReceiver.address,
          sig
        );
      expect(tx).to.emit(account, "Executed").withArgs(to, value, data);
      expect(await account.nonce()).to.equal(nonceBefore.add(1));
      expect(await account.owner()).to.equal(other.address);

      const accountGasTokenAmountAfrter = await gasToken.balanceOf(
        account.address
      );
      const refundGasTokenAmount = accountGasTokenBalanceBefore.sub(
        accountGasTokenAmountAfrter
      );
      expect(tx)
        .to.emit(account, "Refunded")
        .withArgs(gasReceiver.address, gasToken.address, refundGasTokenAmount);
      expect(refundGasTokenAmount).to.be.gt(gasOverhead.mul(gasPrice));
      expect(await gasToken.balanceOf(gasReceiver.address)).to.equal(
        refundGasTokenAmount
      );
    });
  });
});
