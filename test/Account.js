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

  it('execute & update', async () =>
  {
    const dummy = await Account.new({ from: owner });
    await this.account.initializeOwner(owner, { from: owner });

    expect(await this.account.implementation()).to.be.equal(ZERO_ADDRESS);

    const data = this.account.contract.methods.update(dummy.address).encodeABI();

    const receipt = await this.account.execute(this.account.address, zero, data, { from: owner });
    expect(await this.account.implementation()).to.be.equal(dummy.address);
    expectEvent(receipt, 'Executed', {
      dest: this.account.address,
      value: zero,
      data: data,
    });
    expectEvent(receipt, 'Updated', { impl: dummy.address });

    await expectRevert(this.account.execute(this.account.address, zero, data, { from: other }), 'must be owner');
    await expectRevert(this.account.update(this.account.address, { from: owner }), 'must be self');
  });
});
