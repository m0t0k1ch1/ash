const { accounts, contract }                       = require('@openzeppelin/test-environment');
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect }                                   = require('chai');

const { ZERO_ADDRESS } = constants;

const Account = contract.fromArtifact('Account');

describe('Account', async () =>
{
  const [ owner, other ] = accounts;

  const zero = new BN(0);

  beforeEach(async () =>
  {
    this.account = await Account.new({ from: owner });
  });

  it('initialize', async () =>
  {
    expect(await this.account.owner()).to.be.equal(ZERO_ADDRESS);

    const receipt = await this.account.initialize(owner, { from: owner });
    expect(await this.account.owner()).to.be.equal(owner);
    expectEvent(receipt, 'OwnershipTransferred', {
      prevOwner: ZERO_ADDRESS,
      newOwner: owner,
    });

    await expectRevert(this.account.initialize(other, { from: other }), 'already initialized');
  });

  it('execute', async () =>
  {
    await this.account.initialize(owner, { from: owner });

    const data = this.account.contract.methods.transferOwnership(other).encodeABI();

    const receipt = await this.account.execute(this.account.address, zero, data, { from: owner });
    expect(await this.account.owner()).to.be.equal(other);
    expectEvent(receipt, 'Executed', {
      dest: this.account.address,
      value: zero,
      data: data,
    });
    expectEvent(receipt, 'OwnershipTransferred', {
      prevOwner: owner,
      newOwner: other,
    });

    await expectRevert(this.account.execute(this.account.address, zero, data, { from: owner }), 'must be owner');
  });

  it('transferOwnership', async () =>
  {
    await this.account.initialize(owner, { from: owner });

    const receipt = await this.account.transferOwnership(other, { from: owner });
    expect(await this.account.owner()).to.be.equal(other);
    expectEvent(receipt, 'OwnershipTransferred', {
      prevOwner: owner,
      newOwner: other,
    });

    await expectRevert(this.account.transferOwnership(owner, { from: owner }), 'must be owner or self');
    await expectRevert(this.account.transferOwnership(ZERO_ADDRESS, { from: other }), 'address must not be null');
  });

  it('supportsInterface', async () =>
  {
    await this.account.initialize(owner, { from: owner });

    expect(await this.account.supportsInterface('0x01ffc9a7')).to.be.true; // ERC165
    expect(await this.account.supportsInterface('0x4e2312e0')).to.be.true; // ERC1155TokenReceiver
  });
});
