const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN }                 = require('@openzeppelin/test-helpers');
const { expect }             = require('chai');

const Account = contract.fromArtifact('Account');
const Tester  = contract.fromArtifact('Tester');

describe('Account', async () =>
{
  const [ owner ] = accounts;

  const value = new BN(1231006505);

  beforeEach(async () =>
  {
    this.account = await Account.new({ from: owner });
    this.tester  = await Tester.new({ from: owner });
  });

  it('execute', async () =>
  {
    await this.account.execute(this.tester.address, 0, this.tester.contract.methods.setValue(value.toString()).encodeABI(), { from: owner });
    expect(await this.tester.values(this.account.address)).to.be.bignumber.equal(value);
  });
});
