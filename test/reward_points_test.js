/**
 * Smart contract test.
 * For any suggestions please contact me at andrei.dimitrief.jianu(at)gmail.com
 */

var { expectThrow, expectEvent } = require('./utils.js');

var RewardPoints4Test = artifacts.require('RewardPoints4Test');

contract('RewardPoints contract test', async (accounts) => 
{
    let zero = 0x0000000000000000000000000000000000000000;

    let owner = accounts[0];
    let admin1 = accounts[1];
    let admin2 = accounts[2];
    let merchant1 = accounts[3];
    let merchant2 = accounts[4];
    let operator1 = accounts[5];
    let operator2 = accounts[6];
    let user1 = accounts[7];
    let user2 = accounts[8];
    let user3 = accounts[9];
    
    let contract;

    beforeEach(async () => 
    {
        contract = await RewardPoints4Test.new();
    });

    describe('constructor() test', () => 
    {
        it('should set the owner of the contract the address that deployed the contract', async () => 
        {
            let ownerAddress = await contract.owner();

            assert.equal(owner, ownerAddress, "should set the owner of the contract the address that deployed the contract");
        });
    });

    describe('addAdmin() test', () => 
    {
        it('should not add address if transaction not from owner', async () => 
        {
            let tx = contract.addAdmin(admin1, { from: user1 });

            await expectThrow(tx, "should not add address if transaction not from owner");
        });

        it('should not add invalid address as contract admin', async () => 
        {
            let tx = contract.addAdmin(zero, { from: owner });

            await expectThrow(tx, "should not add invalid address as contract admin");
        });

        it('should add address as contract admin', async () => 
        {
            await contract.addAdmin(admin1, { from: owner });

            let isAdmin1 = await contract.isAdmin(admin1);
            let isAdmin2 = await contract.isAdmin(admin2);

            assert.isTrue(isAdmin1, "should add address as contract admin");
            assert.isFalse(isAdmin2, "should add address as contract admin");
        });

        it('should add address as contract admin', async () => 
        {
            await contract.addAdmin(admin1, { from: owner });
            await contract.addAdmin(admin2, { from: owner });

            let isAdmin1 = await contract.isAdmin(admin1);
            let isAdmin2 = await contract.isAdmin(admin2);

            assert.isTrue(isAdmin1, "should add address as contract admin");
            assert.isTrue(isAdmin2, "should add address as contract admin");
        });

        it('should emit add admin event', async () => 
        {
            let tx = contract.addAdmin(admin1, { from: owner });

            expectEvent(tx, 'AddedAdmin', "should emit add admin event");
        });
    });

    describe('removeAdmin() test', () => 
    {
        it('should not remove address if transaction not from owner', async () => 
        {
            await contract.addAdmin(admin1, { from: owner });

            let tx = contract.removeAdmin(admin1, { from: user1 });

            await expectThrow(tx, "should not remove address if transaction not from owner");
        });

        it('should not remove invalid address as contract admin', async () => 
        {
            let tx = contract.removeAdmin(zero, { from: owner });

            await expectThrow(tx, "should not remove invalid address as contract admin");
        });

        it('should remove address as contract admin', async () => 
        {
            await contract.addAdmin(admin1, { from: owner });

            await contract.removeAdmin(admin1, { from: owner });

            let isAdmin1 = await contract.isAdmin(admin1);
            let isAdmin2 = await contract.isAdmin(admin2);

            assert.isFalse(isAdmin1, "should remove address as contract admin");
            assert.isFalse(isAdmin2, "should remove address as contract admin");
        });

        it('should remove address as contract admin', async () => 
        {
            await contract.addAdmin(admin1, { from: owner });
            await contract.addAdmin(admin2, { from: owner });

            await contract.removeAdmin(admin2, { from: owner });

            let isAdmin1 = await contract.isAdmin(admin1);
            let isAdmin2 = await contract.isAdmin(admin2);

            assert.isTrue(isAdmin1, "should remove address as contract admin");
            assert.isFalse(isAdmin2, "should remove address as contract admin");
        });

        it('should emit remove admin event', async () => 
        {
            await contract.addAdmin(admin1, { from: owner });

            let tx = contract.removeAdmin(admin1, { from: owner });

            expectEvent(tx, 'RemovedAdmin', "should emit remove admin event");
        });
    });

    describe('addMerchant() test', () => 
    {
        it('should not allow a non-admin to add a merchant', async () => 
        {
            let tx = contract.addMerchant(merchant1, { from: user1 });

            await expectThrow(tx, "should not allow a non-admin to add a merchant");
        });

        it('should not add invalid address as merchant', async () => 
        {
            let tx = contract.addMerchant(zero, { from: owner });

            await expectThrow(tx, "should not add invalid address as merchant");
        });

        it('should allow contract owner to add a merchant', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });

            let merchant = await contract.getMerchantByAddress(merchant1);
            let merchantId = merchant[0];
            let merchantAddress = merchant[1];
            let merchantIsApproved = merchant[2];

            assert.notEqual(0, merchantId, "should allow contract owner to add a merchant");
            assert.equal(merchant1, merchantAddress, "should allow contract owner to add a merchant");
            assert.isTrue(merchantIsApproved, "should allow contract owner to add a merchant");
        });

        it('should allow a contract admin to add a merchant', async () => 
        {
            await contract.addAdmin(admin1, { from: owner });

            await contract.addMerchant(merchant1, { from: admin1 });

            let merchant = await contract.getMerchantByAddress(merchant1);
            let merchantId = merchant[0];
            let merchantAddress = merchant[1];
            let merchantIsApproved = merchant[2];

            assert.notEqual(0, merchantId, "should allow a contract admin to add a merchant");
            assert.equal(merchant1, merchantAddress, "should allow a contract admin to add a merchant");
            assert.isTrue(merchantIsApproved, "should allow a contract admin to add a merchant");
        });

        it('should emit add merchant event', async () => 
        {
            await contract.addAdmin(admin1, { from: owner });

            let tx = contract.addMerchant(merchant1, { from: admin1 });

            await expectEvent(tx, 'AddedMerchant', "should emit add merchant event");
        });
    });

    describe('banMerchant() test', () => 
    {
        it('should not allow a non-admin to ban a merchant', async () => 
        {
            await contract.addMerchant4Test(merchant1, true, { from: owner });

            let merchant = await contract.getMerchantByAddress(merchant1);
            let merchantId = merchant[0];
            let tx = contract.banMerchant(merchantId, { from: user1 });

            await expectThrow(tx, "should not allow a non-admin to ban a merchant");
        });

        it('should allow contract owner to ban a merchant', async () => 
        {
            await contract.addMerchant4Test(merchant1, true, { from: owner });
            
            let merchant = await contract.getMerchantByAddress(merchant1);
            let merchantId = merchant[0];
            await contract.banMerchant(merchantId, { from: owner });

            merchant = await contract.getMerchantByAddress(merchant1);
            merchantId = merchant[0];
            let merchantAddress = merchant[1];
            let merchantIsApproved = merchant[2];

            assert.notEqual(0, merchantId, "should allow contract owner to ban a merchant");
            assert.equal(merchant1, merchantAddress, "should allow contract owner to ban a merchant");
            assert.isFalse(merchantIsApproved, "should allow contract owner to ban a merchant");
        });

        it('should allow a contract admin to ban a merchant', async () => 
        {
            await contract.addAdmin(admin1, { from: owner });
            await contract.addMerchant4Test(merchant1, true, { from: owner });
            
            let merchant = await contract.getMerchantByAddress(merchant1);
            let merchantId = merchant[0];
            await contract.banMerchant(merchantId, { from: admin1 });

            merchant = await contract.getMerchantByAddress(merchant1);
            merchantId = merchant[0];
            let merchantAddress = merchant[1];
            let merchantIsApproved = merchant[2];

            assert.notEqual(0, merchantId, "should allow a contract admin to ban a merchant");
            assert.equal(merchant1, merchantAddress, "should allow a contract admin to ban a merchant");
            assert.isFalse(merchantIsApproved, "should allow a contract admin to ban a merchant");
        });

        it('should not allow to ban a merchant with an invalid id', async () => 
        {
            let tx = contract.banMerchant(1000, { from: owner });

            await expectThrow(tx, "should not allow to ban a merchant with an invalid id");
        });

        it('should not allow to ban a merchant with an invalid status', async () => 
        {
            await contract.addMerchant4Test(merchant1, false, { from: owner });

            let merchant = await contract.getMerchantByAddress(merchant1);
            let merchantId = merchant[0];
            let tx = contract.banMerchant(merchantId, { from: owner });

            await expectThrow(tx, "should not allow to ban a merchant with an invalid status");
        });

        it('should emit ban merchant event', async () => 
        {
            await contract.addAdmin(admin1, { from: owner });
            await contract.addMerchant(merchant1, { from: owner });
            let merchant = await contract.getMerchantByAddress(merchant1);
            let merchantId = merchant[0];

            let tx = contract.banMerchant(merchantId, { from: admin1 });

            await expectEvent(tx, 'BannedMerchant', "should emit ban merchant event");
        });
    });

    describe('approveMerchant() test', () => 
    {
        it('should not allow a non-admin to approve a merchant', async () => 
        {
            await contract.addMerchant4Test(merchant1, false, { from: owner });

            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);
            let tx = contract.approveMerchant(merchantId, { from: user1 });

            await expectThrow(tx, "should not allow a non-admin to approve a merchant");
        });

        it('should allow contract owner to approve a merchant', async () => 
        {
            await contract.addMerchant4Test(merchant1, false, { from: owner });
            
            let merchant = await contract.getMerchantByAddress(merchant1);
            let merchantId = merchant[0];
            await contract.approveMerchant(merchantId, { from: owner });

            merchant = await contract.getMerchantByAddress(merchant1);
            merchantId = merchant[0];
            let merchantAddress = merchant[1];
            let merchantIsApproved = merchant[2];

            assert.notEqual(0, merchantId, "should allow contract owner to approve a merchant");
            assert.equal(merchant1, merchantAddress, "should allow contract owner to approve a merchant");
            assert.isTrue(merchantIsApproved, "should allow contract owner to approve a merchant");
        });

        it('should allow a contract admin to approve a merchant', async () => 
        {
            await contract.addAdmin(admin1, { from: owner });
            await contract.addMerchant4Test(merchant1, false, { from: owner });
            
            let merchant = await contract.getMerchantByAddress(merchant1);
            let merchantId = merchant[0];
            await contract.approveMerchant(merchantId, { from: admin1 });

            merchant = await contract.getMerchantByAddress(merchant1);
            merchantId = merchant[0];
            let merchantAddress = merchant[1];
            let merchantIsApproved = merchant[2];

            assert.notEqual(0, merchantId, "should allow a contract admin to approve a merchant");
            assert.equal(merchant1, merchantAddress, "should allow a contract admin to approve a merchant");
            assert.isTrue(merchantIsApproved, "should allow a contract admin to approve a merchant");
        });

        it('should not allow to approve a merchant with an invalid id', async () => 
        {
            let tx = contract.approveMerchant(1000, { from: owner });

            await expectThrow(tx, "should not allow to approve a merchant with an invalid id");
        });

        it('should not allow to approve a merchant with an invalid status', async () => 
        {
            await contract.addMerchant4Test(merchant1, true, { from: owner });

            let merchant = await contract.getMerchantByAddress(merchant1);
            let merchantId = merchant[0];
            let tx = contract.approveMerchant(merchantId, { from: owner });

            await expectThrow(tx, "should not allow to approve a merchant with an invalid status");
        });

        it('should emit approve merchant event', async () => 
        {
            await contract.addAdmin(admin1, { from: owner });
            await contract.addMerchant4Test(merchant1, false, { from: owner });
            let merchant = await contract.getMerchantByAddress(merchant1);
            let merchantId = merchant[0];

            let tx = contract.approveMerchant(merchantId, { from: admin1 });

            await expectEvent(tx, 'ApprovedMerchant', "should emit approve merchant event");
        });
    });

    describe('addUser() test', () => 
    {
        it('should not allow a non-admin to add a user', async () => 
        {
            let tx = contract.addUser(user1, { from: user2 });

            await expectThrow(tx, "should not allow a non-admin to add a user");
        });

        it('should not allow invalid address as user', async () => 
        {
            let tx = contract.addUser(zero, { from: owner });

            await expectThrow(tx, "should not allow invalid address as user");
        });

        it('should allow contract owner to add a user', async () => 
        {
            await contract.addUser(user1, { from: owner });

            let user = await contract.getUserByAddress(user1);
            let userId = user[0];
            let userAddress = user[1];
            let userIsApproved = user[2];
            let totalEarnedPoints = user[3];
            let totalReedemedPoints = user[4];

            assert.notEqual(0, userId, "should allow contract owner to add a user");
            assert.equal(user1, userAddress, "should allow contract owner to add a user");
            assert.isTrue(userIsApproved, "should allow contract owner to add a user");
            assert.equal(0, totalEarnedPoints, "should allow contract owner to add a user");
            assert.equal(0, totalReedemedPoints, "should allow contract owner to add a user");
        });

        it('should allow a contract admin to add a user', async () => 
        {
            await contract.addAdmin(admin1, { from: owner });
            await contract.addUser(user1, { from: admin1 });

            let user = await contract.getUserByAddress(user1);
            let userId = user[0];
            let userAddress = user[1];
            let userIsApproved = user[2];
            let totalEarnedPoints = user[3];
            let totalReedemedPoints = user[4];

            assert.notEqual(0, userId, "should allow contract owner to add a user");
            assert.equal(user1, userAddress, "should allow contract owner to add a user");
            assert.isTrue(userIsApproved, "should allow contract owner to add a user");
            assert.equal(0, totalEarnedPoints, "should allow contract owner to add a user");
            assert.equal(0, totalReedemedPoints, "should allow contract owner to add a user");
        });

        it('should emit add user event', async () => 
        {
            let tx = contract.addUser(user1, { from: owner });

            await expectEvent(tx, 'AddedUser', "should emit add user event");
        });
    });

    describe('banUser() test', () => 
    {
        it('should not allow a non-admin to ban a user', async () => 
        {
            await contract.addUser4Test(user1, true, 0, 0, { from: owner });

            let tx = contract.banUser(user1, { from: user2 });

            await expectThrow(tx, "should not allow a non-admin to ban a user");
        });

        it('should not allow invalid address as user', async () => 
        {
            let tx = contract.banUser(zero, { from: owner });

            await expectThrow(tx, "should not allow invalid address as user");
        });

        it('should allow contract owner to ban a user', async () => 
        {
            await contract.addUser4Test(user1, true, 0, 0, { from: owner });
            
            await contract.banUser(user1, { from: owner });

            let user = await contract.getUserByAddress(user1);
            let userId = user[0];
            let userAddress = user[1];
            let userIsApproved = user[2];
            let totalEarnedPoints = user[3];
            let totalReedemedPoints = user[4];

            assert.notEqual(0, userId, "should allow contract owner to ban a user");
            assert.equal(user1, userAddress, "should allow contract owner to ban a user");
            assert.isFalse(userIsApproved, "should allow contract owner to ban a user");
            assert.equal(0, totalEarnedPoints, "should allow contract owner to ban a user");
            assert.equal(0, totalReedemedPoints, "should allow contract owner to ban a user");
        });

        it('should allow a contract admin to ban a user', async () => 
        {
            await contract.addUser4Test(user1, true, 0, 0, { from: owner });
            await contract.addAdmin(admin1, { from: owner });
            
            await contract.banUser(user1, { from: admin1 });

            let user = await contract.getUserByAddress(user1);
            let userId = user[0];
            let userAddress = user[1];
            let userIsApproved = user[2];
            let totalEarnedPoints = user[3];
            let totalReedemedPoints = user[4];

            assert.notEqual(0, userId, "should allow a contract admin to ban a user");
            assert.equal(user1, userAddress, "should allow a contract admin to ban a user");
            assert.isFalse(userIsApproved, "should allow a contract admin to ban a user");
            assert.equal(0, totalEarnedPoints, "should allow a contract admin to ban a user");
            assert.equal(0, totalReedemedPoints, "should allow a contract admin to ban a user");
        });

        it('should not allow to ban a user with an invalid id', async () => 
        {
            let tx = contract.banUser(user1, { from: owner });

            await expectThrow(tx, "should not allow to ban a user with an invalid id");
        });

        it('should not allow to ban a user with an invalid status', async () => 
        {
            await contract.addUser4Test(user1, false, 0, 0, { from: owner });

            let tx = contract.banUser(user1, { from: owner });

            await expectThrow(tx, "should not allow to ban a user with an invalid status");
        });

        it('should emit ban user event', async () => 
        {
            await contract.addUser4Test(user1, true, 0, 0, { from: owner });
            
            let tx = contract.banUser(user1, { from: owner });

            await expectEvent(tx, 'BannedUser', "should emit ban user event");
        });
    });

    describe('approveUser() test', () => 
    {
        it('should not allow a non-admin to approve a user', async () => 
        {
            await contract.addUser4Test(user1, false, 0, 0, { from: owner });

            let tx = contract.approveUser(user1, { from: user2 });

            await expectThrow(tx, "should not allow a non-admin to approve a user");
        });

        it('should not allow invalid address as user', async () => 
        {
            let tx = contract.approveUser(zero, { from: owner });

            await expectThrow(tx, "should not allow invalid address as user");
        });

        it('should allow contract owner to approve a user', async () => 
        {
            await contract.addUser4Test(user1, false, 0, 0, { from: owner });
            
            await contract.approveUser(user1, { from: owner });

            let user = await contract.getUserByAddress(user1);
            let userId = user[0];
            let userAddress = user[1];
            let userIsApproved = user[2];
            let totalEarnedPoints = user[3];
            let totalReedemedPoints = user[4];

            assert.notEqual(0, userId, "should allow contract owner to approve a user");
            assert.equal(user1, userAddress, "should allow contract owner to approve a user");
            assert.isTrue(userIsApproved, "should allow contract owner to approve a user");
            assert.equal(0, totalEarnedPoints, "should allow contract owner to approve a user");
            assert.equal(0, totalReedemedPoints, "should allow contract owner to approve a user");
        });

        it('should allow a contract admin to approve a user', async () => 
        {
            await contract.addUser4Test(user1, false, 0, 0, { from: owner });
            await contract.addAdmin(admin1, { from: owner });
            
            await contract.approveUser(user1, { from: admin1 });

            let user = await contract.getUserByAddress(user1);
            let userId = user[0];
            let userAddress = user[1];
            let userIsApproved = user[2];
            let totalEarnedPoints = user[3];
            let totalReedemedPoints = user[4];

            assert.notEqual(0, userId, "should allow a contract admin to approve a user");
            assert.equal(user1, userAddress, "should allow a contract admin to approve a user");
            assert.isTrue(userIsApproved, "should allow a contract admin to approve a user");
            assert.equal(0, totalEarnedPoints, "should allow a contract admin to approve a user");
            assert.equal(0, totalReedemedPoints, "should allow a contract admin to approve a user");
        });

        it('should not allow to approve a user with an invalid id', async () => 
        {
            let tx = contract.approveUser(user1, { from: owner });

            await expectThrow(tx, "should not allow to approve a user with an invalid id");
        });

        it('should not allow to approve a user with an invalid status', async () => 
        {
            await contract.addUser4Test(user1, true, 0, 0, { from: owner });

            let tx = contract.approveUser(user1, { from: owner });

            await expectThrow(tx, "should not allow to approve a user with an invalid status");
        });

        it('should emit approve user event', async () => 
        {
            await contract.addUser4Test(user1, false, 0, 0, { from: owner });
            
            let tx = contract.approveUser(user1, { from: owner });

            await expectEvent(tx, 'ApprovedUser', "should emit approve user event");
        });
    });

    describe('addOperator() test', () => 
    {
        it('should not allow a non-merchant to add an operator', async () => 
        {
            let tx = contract.addOperator(operator1, { from: user1 });

            await expectThrow(tx, "should not allow a non-merchant to add an operator");
        });

        it('should not allow invalid address as operator', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });

            let tx = contract.addOperator(zero, { from: merchant1 });

            await expectThrow(tx, "should not allow invalid address as operator");
        });

        it('should allow a merchant to add an operator', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            await contract.addOperator(operator1, { from: merchant1 });

            let isOperator1 = await contract.getOperatorStatus4Test(merchant1, operator1);
            let isOperator2 = await contract.getOperatorStatus4Test(merchant1, operator2);

            assert.isTrue(isOperator1, "should allow a merchant to add an operator");
            assert.isFalse(isOperator2, "should allow a merchant to add an operator");
        });

        it('should not allow a merchant to add an operator twice', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            await contract.addOperator(operator1, { from: merchant1 });

            tx = contract.addOperator(operator1, { from: merchant1 });

            await expectThrow(tx, "should not allow a merchant to add an operator twice");
        });

        it('should not allow a merchant to add an operator when paused', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            await contract.pause({ from: owner });
            
            tx = contract.addOperator(operator1, { from: merchant1 });

            await expectThrow(tx, "should not allow a merchant to add an operator when paused");
        });

        it('should emit add operator event', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });

            let tx =  contract.addOperator(operator1, { from: merchant1 });

            await expectEvent(tx, 'AddedOperator', "should emit add operator event");
        });
    });

    describe('removeOperator() test', () => 
    {
        it('should not allow a non-merchant to remove an operator', async () => 
        {
            await contract.addUser(user1, { from: owner });

            let tx = contract.removeOperator(operator1, { from: user1 });

            await expectThrow(tx, "should not allow a non-merchant to remove an operator");
        });

        it('should not allow invalid address as operator', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });

            let tx = contract.removeOperator(zero, { from: merchant1 });

            await expectThrow(tx, "should not allow invalid address as operator");
        });

        it('should allow a merchant to remove an operator', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            await contract.addOperator(operator1, { from: merchant1 });

            await contract.removeOperator(operator1, { from: merchant1 });

            let isOperator1 = await contract.getOperatorStatus4Test(merchant1, operator1);

            assert.isFalse(isOperator1, "should allow a merchant to remove an operator");
        });

        it('should not allow a merchant to remove an operator twice', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            await contract.addOperator(operator1, { from: merchant1 });

            await contract.removeOperator(operator1, { from: merchant1 });
            let tx = contract.removeOperator(operator1, { from: merchant1 });

            await expectThrow(tx, "should not allow a merchant to remove an operator twice");
        });

        it('should not allow a merchant to remove an operator when paused', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            await contract.addOperator(operator1, { from: merchant1 });
            await contract.pause({ from: owner });

            let tx = contract.removeOperator(operator1, { from: merchant1 });

            await expectThrow(tx, "should not allow a merchant to remove an operator when paused");
        });

        it('should emit remove operator event', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            await contract.addOperator(operator1, { from: merchant1 });

            let tx = contract.removeOperator(operator1, { from: merchant1 });

            await expectEvent(tx, 'RemovedOperator', "should emit remove operator event");
        });
    });

    describe('transferMerchantOwnership() test', () => 
    {
        it('should not allow a non-merchant to execute a transfer', async () => 
        {
            await contract.addUser(user1, { from: owner });

            let tx = contract.transferMerchantOwnership(merchant2, { from: user1 });

            await expectThrow(tx, "should not allow a non-merchant to execute a transfer");
        });

        it('should not allow a merchant to execute a transfer to an existing merchant', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            await contract.addMerchant(merchant2, { from: owner });

            let tx = contract.transferMerchantOwnership(merchant2, { from: merchant1 });

            await expectThrow(tx, "should not allow a merchant to execute a transfer to an existing merchant");
        });

        it('should not allow invalid address as merchant', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });

            let tx = contract.transferMerchantOwnership(zero, { from: merchant1 });

            await expectThrow(tx, "should not allow invalid address as merchant");
        });

        it('should allow a merchant to execute a transfer', async () => 
        {
            await contract.addMerchant(merchant1, { from:owner });
            await contract.addOperator(operator1, { from: merchant1 });

            await contract.transferMerchantOwnership(merchant2, { from: merchant1 });

            await contract.addOperator(operator2, { from: merchant2 });

            let isOperator1 = await contract.getOperatorStatus4Test(merchant2, operator1);
            let isOperator2 = await contract.getOperatorStatus4Test(merchant2, operator2);
            let ownerOperator1 = await contract.getOwnerAddressForOperatorAddress4Test(operator1);
            let ownerOperator2 = await contract.getOwnerAddressForOperatorAddress4Test(operator2);

            assert.isTrue(isOperator1, "should allow a merchant to execute a transfer");
            assert.isTrue(isOperator2, "should allow a merchant to execute a transfer");
            assert.equal(merchant2, ownerOperator1, "should allow a merchant to execute a transfer");
            assert.equal(merchant2, ownerOperator2, "should allow a merchant to execute a transfer");
        });

        it('should not allow a merchant to execute a transfer when paused', async () => 
        {
            await contract.addMerchant(merchant1, { from:owner });
            await contract.addOperator(operator1, { from: merchant1 });
            await contract.pause({ from: owner });

            let tx = contract.transferMerchantOwnership(merchant2, { from: merchant1 });

            await expectThrow(tx, "should not allow a merchant to execute a transfer when paused");
        });

        it('should emit transfer ownership event', async () => 
        {
            await contract.addMerchant(merchant1, { from:owner });
            await contract.addOperator(operator1, { from: merchant1 });

            let tx = contract.transferMerchantOwnership(merchant2, { from: merchant1 });

            await expectEvent(tx, 'TransferredMerchantOwnership', "should emit transfer ownership event");
        });
    });

    describe('rewardUser() test', () => 
    {
        it('should not allow a non-merchant to reward an user', async () => 
        {
            await contract.addUser(user1, { from: owner });

            let tx = contract.rewardUser(user1, 100, { from: user2 });

            await expectThrow(tx, "should not allow a non-merchant to reward an user");
        });

        it('should not allow a non-approved merchant', async () => 
        {
            await contract.addMerchant4Test(merchant1, false, { from: owner });
            await contract.addUser(user1, { from: owner });

            let tx = contract.rewardUser(user1, 100, { from: merchant1 });

            await expectThrow(tx, "should not allow a non-approved merchant");
        });

        it('should not allow invalid user address', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });

            let tx = contract.rewardUser(zero, 100, {from: merchant1 });

            await expectThrow(tx, "should not allow invalid user address");
        });

        it('should not allow non-existing user address', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });

            let tx = contract.rewardUser(user1, 100, {from: merchant1 });

            await expectThrow(tx, "should not allow non-existing user address");
        });

        it('should not allow not approved user address', async () => 
        {
            await contract.addMerchant4Test(merchant1, true, { from: owner });
            await contract.addUser4Test(user1, false, 0, 0, { from: owner });

            let tx = contract.rewardUser(user1, 100, { from: merchant1 });

            await expectThrow(tx, "should not allow not approved user address");
        });

        it('should not allow zero rewards', async () => 
        {
            await contract.addMerchant4Test(merchant1, true, { from: owner });
            await contract.addUser4Test(user1, true, 0, 0, { from: owner });

            let tx = contract.rewardUser(user1, 0, { from: merchant1 });

            await expectThrow(tx, "should not allow zero rewards");
        });

        it('should not allow merchant to reward herself', async () => 
        {
            await contract.addMerchant4Test(merchant1, true, { from: owner });
            await contract.addUser4Test(merchant1, true, 0, 0, { from: owner });

            let tx = contract.rewardUser(merchant1, 0, { from: merchant1 });

            await expectThrow(tx, "should not allow merchant to reward herself");
        });

        it('should allow a merchant to reward an existing user', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            await contract.addMerchant(merchant2, { from: owner });
            await contract.addUser(user1, { from: owner });
            await contract.addUser(user2, { from: owner });

            await contract.rewardUser(user1, 100, { from: merchant1 });
            await contract.rewardUser(user1, 50, { from: merchant2 });
            await contract.rewardUser(user2, 25, { from: merchant2 });

            let user1PointsTotal = await contract.getUserRewardPoints4Test(user1);
            let user1PointsFromMerchant1 = await contract.getUserRewardPointsFromMerchant4Test(user1, merchant1);
            let user1PointsFromMerchant2 = await contract.getUserRewardPointsFromMerchant4Test(user1, merchant2);

            let user2PointsTotal = await contract.getUserRewardPoints4Test(user2);
            let user2PointsFromMerchant1 = await contract.getUserRewardPointsFromMerchant4Test(user2, merchant1);
            let user2PointsFromMerchant2 = await contract.getUserRewardPointsFromMerchant4Test(user2, merchant2);

            assert.equal(150, user1PointsTotal, "should allow a merchant to reward an existing user");
            assert.equal(100, user1PointsFromMerchant1, "should allow a merchant to reward an existing user");
            assert.equal(50, user1PointsFromMerchant2, "should allow a merchant to reward an existing user");

            assert.equal(25, user2PointsTotal, "should allow a merchant to reward an existing user");
            assert.equal(0, user2PointsFromMerchant1, "should allow a merchant to reward an existing user");
            assert.equal(25, user2PointsFromMerchant2, "should allow a merchant to reward an existing user");
        });

        it('should allow an operator to reward an existing user', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            await contract.addOperator(operator1, { from: merchant1 });
            await contract.addMerchant(merchant2, { from: owner });
            await contract.addOperator(operator2, { from: merchant2 });
            await contract.addUser(user1, { from: owner });
            await contract.addUser(user2, { from: owner });

            await contract.rewardUser(user1, 80, { from: merchant1 });
            await contract.rewardUser(user1, 20, { from: operator1 });
            await contract.rewardUser(user1, 50, { from: operator2 });
            await contract.rewardUser(user2, 25, { from: operator2 });

            let user1PointsTotal = await contract.getUserRewardPoints4Test(user1);
            let user1PointsFromMerchant1 = await contract.getUserRewardPointsFromMerchant4Test(user1, merchant1);
            let user1PointsFromMerchant2 = await contract.getUserRewardPointsFromMerchant4Test(user1, merchant2);

            let user2PointsTotal = await contract.getUserRewardPoints4Test(user2);
            let user2PointsFromMerchant1 = await contract.getUserRewardPointsFromMerchant4Test(user2, merchant1);
            let user2PointsFromMerchant2 = await contract.getUserRewardPointsFromMerchant4Test(user2, merchant2);

            assert.equal(150, user1PointsTotal, "should allow an operator to reward an existing user");
            assert.equal(100, user1PointsFromMerchant1, "should allow an operator to reward an existing user");
            assert.equal(50, user1PointsFromMerchant2, "should allow an operator to reward an existing user");

            assert.equal(25, user2PointsTotal, "should allow an operator to reward an existing user");
            assert.equal(0, user2PointsFromMerchant1, "should allow an operator to reward an existing user");
            assert.equal(25, user2PointsFromMerchant2, "should allow an operator to reward an existing user");
        });

        it('should not allow an operator to reward an existing user when paused', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            await contract.addOperator(operator1, { from: merchant1 });
            await contract.addMerchant(merchant2, { from: owner });
            await contract.addOperator(operator2, { from: merchant2 });
            await contract.addUser(user1, { from: owner });
            await contract.addUser(user2, { from: owner });

            await contract.rewardUser(user1, 80, { from: merchant1 });
            await contract.rewardUser(user1, 20, { from: operator1 });
            await contract.rewardUser(user1, 50, { from: operator2 });

            await contract.pause({ from: owner });

            let tx = contract.rewardUser(user2, 25, { from: operator2 });

            await expectThrow(tx, "should not allow merchant to reward user when paused");
        });

        it('should emit reward user event', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            await contract.addUser(user1, { from: owner });

            let tx = contract.rewardUser(user1, 100, { from: merchant1 });

            await expectEvent(tx, 'RewardedUser', "should emit reward user event");
        });
    });

    describe('redeemPoints() test', () => 
    {
        it('should not allow a merchant with invalid id', async () => 
        {
            await contract.addUser4Test(user1, true, 0, 0, { from: owner });
            
            let tx = contract.redeemPoints(1000, 10, { from: user1 });

            await expectThrow(tx, "should not allow a merchant with invalid id");
        });

        it('should not allow a non-approved merchant', async () => 
        {
            await contract.addUser4Test(user1, true, 0, 0, { from: owner });
            await contract.addMerchant4Test(merchant1, false, { from: owner });
            await contract.addUserRewardPointsForMerchant4Test(user1, merchant1, 100);
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            let tx = contract.redeemPoints(merchantId, 25, { from: user1 });

            await expectThrow(tx, "should not allow a non-approved merchant");
        });

        it('should not allow a non-user to reedem points', async () => 
        {
            await contract.addMerchant4Test(merchant1, false, { from: owner });
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            let tx = contract.redeemPoints(merchantId, 25, { from: user1 });

            await expectThrow(tx, "should not allow a non-user to reedem points");
        });

        it('should not allow a non-approved user to reedem points', async () => 
        {
            await contract.addUser4Test(user1, true, 0, 0, { from: owner });
            await contract.addMerchant4Test(merchant1, true, { from: owner });
            await contract.addUserRewardPointsForMerchant4Test(user1, merchant1, 100);
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            await contract.banUser(user1, { from: owner });

            let tx = contract.redeemPoints(merchantId, 25, { from: user1 });

            await expectThrow(tx, "should not allow a non-approved user to reedem points");
        });

        it('should not allow a user to redeem points from a non-approved merchant', async () => 
        {
            await contract.addUser4Test(user1, true, 0, 0, { from: owner });
            await contract.addMerchant4Test(merchant1, true, { from: owner });
            await contract.addUserRewardPointsForMerchant4Test(user1, merchant1, 100);
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            await contract.banMerchant(merchantId, { from: owner });

            let tx = contract.redeemPoints(merchantId, 25, { from: user1 });

            await expectThrow(tx, "should not allow a user to redeem points from a non-approved merchant");
        });

        it('should not allow users to reedem more points than they are rewarded', async () => 
        {
            await contract.addUser4Test(user1, true, 0, 0, { from: owner });
            await contract.addMerchant4Test(merchant1, true, { from: owner });
            await contract.addUserRewardPointsForMerchant4Test(user1, merchant1, 100);
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            let tx = contract.redeemPoints(merchantId, 125, { from: user1 });

            await expectThrow(tx, "should not allow users to reedem more points than they are rewarded");
        });

        it('should allow a valid user to reedem points', async () => 
        {
            await contract.addUser4Test(user1, true, 0, 0, { from: owner });
            await contract.addMerchant4Test(merchant1, true, { from: owner });
            await contract.addMerchant4Test(merchant2, true, { from: owner });
            await contract.addUserRewardPointsForMerchant4Test(user1, merchant1, 100);
            await contract.addUserRewardPointsForMerchant4Test(user1, merchant2, 100);

            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            await contract.redeemPoints(merchantId, 25, { from: user1 });

            let userRewardPointsTotal = await contract.getUserRewardPoints4Test(user1);
            let userRewardPointsFromMerchant1 = await contract.getUserRewardPointsFromMerchant4Test(user1, merchant1);
            let userRewardPointsFromMerchant2 = await contract.getUserRewardPointsFromMerchant4Test(user1, merchant2);
            let userRedeemedPointsTotal = await contract.getUserRedeemedPoints4Test(user1);
            let userRedeemedPointsFromMerchant1 = await contract.getUserRedeemedPointsFromMerchant4Test(user1, merchant1);
            let userRedeemedPointsFromMerchant2 = await contract.getUserRedeemedPointsFromMerchant4Test(user1, merchant2);

            assert.equal(175, userRewardPointsTotal, "should allow a valid user to reedem points");
            assert.equal(75, userRewardPointsFromMerchant1, "should allow a valid user to reedem points");
            assert.equal(100, userRewardPointsFromMerchant2, "should allow a valid user to reedem points");
            assert.equal(25, userRedeemedPointsTotal, "should allow a valid user to reedem points");
            assert.equal(25, userRedeemedPointsFromMerchant1, "should allow a valid user to reedem points");
            assert.equal(0, userRedeemedPointsFromMerchant2, "should allow a valid user to reedem points");
        });

        it('should not allow a valid user to reedem points when paused', async () => 
        {
            await contract.addUser4Test(user1, true, 0, 0, { from: owner });
            await contract.addMerchant4Test(merchant1, true, { from: owner });
            await contract.addMerchant4Test(merchant2, true, { from: owner });
            await contract.addUserRewardPointsForMerchant4Test(user1, merchant1, 100);
            await contract.addUserRewardPointsForMerchant4Test(user1, merchant2, 100);

            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            await contract.pause({ from: owner });

            let tx = contract.redeemPoints(merchantId, 25, { from: user1 });

            await expectThrow(tx, "should not allow a valid user to reedem points when paused");
        });

        it('should emit reedem points event', async () => 
        {
            await contract.addUser4Test(user1, true, 0, 0, { from: owner });
            await contract.addMerchant4Test(merchant1, true, { from: owner });
            await contract.addUserRewardPointsForMerchant4Test(user1, merchant1, 100);
 
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            let tx = contract.redeemPoints(merchantId, 25, { from: user1 });

            await expectEvent(tx, 'RedeemedPoints', "should emit reedem points event");
        });
    });

    describe('getMerchantById() test', () => 
    {
        it('should not allow invalid merchant id', async () => 
        {
            let tx = contract.getMerchantById(1000, { from: user3 });

            await expectThrow(tx, "should not allow invalid merchant id");
        });

        it('should return merchant info for valid merchant id', async () => 
        {
            await contract.addMerchant4Test(merchant1, false, { from: owner });
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            let merchantInfo = await contract.getMerchantById(merchantId, { from: user3 });
            let id = merchantInfo[0];
            let address = merchantInfo[1];
            let isApproved = merchantInfo[2];

            assert.equal(merchantId.toString(), id.toString(), "should return merchant info for valid merchant id");
            assert.equal(merchant1, address, "should return merchant info for valid merchant id");
            assert.equal(false, isApproved, "should return merchant info for valid merchant id");
        });
    });

    describe('getMerchantByAddress() test', () => 
    {
        it('should not allow invalid merchant address', async () => 
        {
            let tx = contract.getMerchantByAddress(zero, { from: user3 });

            await expectThrow(tx, "should not allow invalid merchant address");
        });

        it('should not allow non-existing merchant address', async () => 
        {
            let tx = contract.getMerchantByAddress(merchant1, { from: user3 });

            await expectThrow(tx, "should not allow non-existing merchant address");
        });

        it('should return merchant info for valid merchant address', async () => 
        {
            await contract.addMerchant4Test(merchant1, false, { from: owner });
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            let merchantInfo = await contract.getMerchantByAddress(merchant1, { from: user3 });
            let id = merchantInfo[0];
            let address = merchantInfo[1];
            let isApproved = merchantInfo[2];

            assert.equal(merchantId.toString(), id.toString(), "should return merchant info for valid merchant address");
            assert.equal(merchant1, address, "should return merchant info for valid merchant address");
            assert.equal(false, isApproved, "should return merchant info for valid merchant address");
        });
    });

    describe('isMerchantOperator() test', () => 
    {
        it('should not allow invalid merchant id', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            await contract.addOperator(operator1, { from: merchant1 });

            let tx = contract.isMerchantOperator(operator1, zero);

            await expectThrow(tx, "should not allow invalid merchant id");
        });

        it('should not allow invalid operator address', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            await contract.addOperator(operator1, { from: merchant1 });
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            let tx = contract.isMerchantOperator(zero, merchantId);

            await expectThrow(tx, "should not allow invalid operator address");
        });

        it('should return status for non-existing operator', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            let isOperator = await contract.isMerchantOperator(operator1, merchantId);

            assert.isFalse(isOperator, "should return status for non-existing operator");
        });

        it('should return status for exisitng operator', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            await contract.addOperator(operator1, { from: merchant1 });
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            let isOperator = await contract.isMerchantOperator(operator1, merchantId);

            assert.isTrue(isOperator, "should return status for exisitng operator");
        });

        it('should return status for banned operator', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            await contract.addOperator(operator1, { from: merchant1 });
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            await contract.removeOperator(operator1, { from: merchant1 });

            let isOperator = await contract.isMerchantOperator(operator1, merchantId);

            assert.isFalse(isOperator, "should return status for banned operator");
        });
    });

    describe('getUserById() test', () => 
    {
        it('should not allow invalid user id', async () => 
        {
            let tx = contract.getUserById(1000, { from: user3 });

            await expectThrow(tx, "should not allow invalid user id");
        });

        it('should return user info for existing user', async () => 
        {
            await contract.addUser4Test(user1, false, 0, 0, { from: owner });
            let userId = await contract.getUserIdWithAddress4Test(user1);

            let userInfo = await contract.getUserById(userId, { from: user3 });
            let id = userInfo[0];
            let address = userInfo[1];
            let isApproved = userInfo[2];

            assert.equal(userId.toString(), id.toString(), "should return user info for existing user");
            assert.equal(user1, address, "should return user info for existing user");
            assert.equal(false, isApproved, "should return user info for existing user");
        });
    });

    describe('getUserByAddress() test', () => 
    {
        it('should not allow invalid user address', async () => 
        {
            let tx = contract.getUserByAddress(zero, { from: user3 });

            await expectThrow(tx, "should not allow invalid user address");
        });

        it('should not allow address of non-existing user', async () => 
        {
            let tx = contract.getUserByAddress(user1, { from: user3 });

            await expectThrow(tx, "should not allow invalid user address");
        });

        it('should return user info for valid user address', async () => 
        {
            await contract.addUser4Test(user1, false, 0, 0, { from: owner });
            let userId = await contract.getUserIdWithAddress4Test(user1);

            let userInfo = await contract.getUserByAddress(user1, { from: user3 });
            let id = userInfo[0];
            let address = userInfo[1];
            let isApproved = userInfo[2];

            assert.equal(userId.toString(), id.toString(), "should return user info for valid user address");
            assert.equal(user1, address, "should return user info for valid user address");
            assert.equal(false, isApproved, "should return user info for valid user address");
        });
    });

    describe('getUserEarnedPointsAtMerchant() test', () => 
    {
        it('should not allow invalid user address', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            let tx = contract.getUserEarnedPointsAtMerchant(zero, merchantId, { from: user3 });

            await expectThrow(tx, "should not allow invalid user address");
        });

        it('should not allow non-existing user', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            let tx = contract.getUserEarnedPointsAtMerchant(user1, merchantId, { from: user3 });

            await expectThrow(tx, "should not allow non-existing user");
        });

        it('should not allow non-existing merchant', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);
            await contract.addUser(user1, { from: owner });

            let tx = contract.getUserEarnedPointsAtMerchant(user1, 1000, { from: user3 });

            await expectThrow(tx, "should not allow non-existing merchant");
        });

        it('should return the user reward points', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            await contract.addUser(user1, { from: owner });
            await contract.rewardUser(user1, 100, { from: merchant1 });

            let points = await contract.getUserEarnedPointsAtMerchant(user1, merchantId, { from: user3 });

            assert.equal(100, points, "should return the user reward points");
        });
    });

    describe('getUserRedeemedPointsAtMerchant() test', () => 
    {
        it('should not allow invalid user address', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            await contract.addUser(user1, { from: owner });
            await contract.rewardUser(user1, 1000, { from: merchant1 });

            let tx = contract.getUserRedeemedPointsAtMerchant(zero, merchantId, { from: user3 });

            await expectThrow(tx, "should not allow invalid user address");
        });

        it('should not allow non-existing user', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            await contract.addUser(user1, { from: owner });
            await contract.rewardUser(user1, 1000, { from: merchant1 });

            let tx = contract.getUserRedeemedPointsAtMerchant(user2, merchantId, { from: user3 });

            await expectThrow(tx, "should not allow non-existing user");
        });

        it('should not allow non-existing merchant', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            await contract.addUser(user1, { from: owner });
            await contract.rewardUser(user1, 1000, { from: merchant1 });

            let tx = contract.getUserRedeemedPointsAtMerchant(user1, 1000, { from: user3 });

            await expectThrow(tx, "should not allow non-existing merchant");
        });

        it('should return the user redeemed points', async () => 
        {
            await contract.addMerchant(merchant1, { from: owner });
            let merchantId = await contract.getMerchantIdWithAddress4Test(merchant1);

            await contract.addUser(user1, { from: owner });
            await contract.rewardUser(user1, 100, { from: merchant1 });
            await contract.redeemPoints(merchantId, 25, { from: user1 });

            let points = await contract.getUserRedeemedPointsAtMerchant(user1, merchantId, { from: user3 });

            assert.equal(25, points, "should return the user redeemed points");
        });
    });

});
