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

  it('update', async () =>
  {
    const data = this.account.contract.methods.update(owner).encodeABI();

    expect(await this.account.implementation()).to.be.equal(ZERO_ADDRESS);

    const receipt = await this.account.execute(this.account.address, zero, data, { from: owner });
    expect(await this.account.implementation()).to.be.equal(owner);
    expectEvent(receipt, 'Updated', { impl: owner });

    await expectRevert(this.account.update(owner, { from: owner }), 'must be self');
  });

  it('execute', async () =>
  {
    await this.account.execute(this.tester.address, 0, this.tester.contract.methods.setValue(value.toString()).encodeABI(), { from: owner });
    expect(await this.tester.values(this.account.address)).to.be.bignumber.equal(value);
  });
});
