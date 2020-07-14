const { accounts, contract }                       = require('@openzeppelin/test-environment');
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect }                                   = require('chai');

const { ZERO_ADDRESS } = constants;

const Account = contract.fromArtifact('Account');
const Tester  = contract.fromArtifact('Tester');

describe('Account', async () =>
{
  const [ owner, other ] = accounts;

  const zero  = new BN(0);
  const value = new BN(1231006505);

  beforeEach(async () =>
  {
    this.account = await Account.new({ from: owner });
    this.tester  = await Tester.new({ from: owner });
  });

  it('initialize', async () =>
  {
    expect(await this.account.initialized()).to.be.false;
    expect(await this.account.owner()).to.be.equal(owner);

    await this.account.initialize(other, { from: other });
    expect(await this.account.initialized()).to.be.true;
    expect(await this.account.owner()).to.be.equal(other);

    await expectRevert(this.account.initialize(owner, { from: owner }), 'already initialized');
  });

  it('execute', async () =>
  {
    await this.account.initialize(owner, { from: owner });

    const data = this.tester.contract.methods.setValue(value.toString()).encodeABI();

    const receipt = await this.account.execute(this.tester.address, zero, data, { from: owner });
    expect(await this.tester.values(this.account.address)).to.be.bignumber.equal(value);
    expectEvent(receipt, 'Executed', {
      dest: this.tester.address,
      value: zero,
      data: data,
    });

    expectRevert(this.account.execute(this.tester.address, zero, data, { from: other }), 'must be owner');
  });

  it('update', async () =>
  {
    await this.account.initialize(owner, { from: owner });

    expect(await this.account.implementation()).to.be.equal(ZERO_ADDRESS);

    const data = this.account.contract.methods.update(owner).encodeABI();

    const receipt = await this.account.execute(this.account.address, zero, data, { from: owner });
    expect(await this.account.implementation()).to.be.equal(owner);
    expectEvent(receipt, 'Updated', { impl: owner });

    await expectRevert(this.account.update(owner, { from: owner }), 'must be self');
  });
});
