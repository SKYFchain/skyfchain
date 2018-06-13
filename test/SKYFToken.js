/* jshint ignore: start */

var SKYFToken = artifacts.require("./SKYFToken.sol");
var SKYFCrowdsale = artifacts.require("./SKYFCrowdsale.sol")
var SKYFNetworkDevelopmentFund = artifacts.require("./SKYFNetworkDevelopmentFund.sol")
var SKYFReserveFund = artifacts.require("./SKYFReserveFund.sol")
var SKYFTeamFund = artifacts.require("./SKYFTeamFund.sol")
var BigNumber = require("bignumber.js");
var env = require("../env.js");

contract('SKYFToken', function() {
    let token, crowdsale, ndf, rf, tf
    let me

    function form18DecimalsTo1(source) {
        return source.dividedBy(new BigNumber(10).pow(18)).toNumber();
    }

    // Move forward
    function quantumLeap(days) {
        web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [86400 * days], id: 0});
    }

    beforeEach(async function () {
        ndf = await SKYFNetworkDevelopmentFund.new({from: env.tests.accounts.owner, gas: env.network.gasAmount});
        rf = await SKYFReserveFund.new({from: env.tests.accounts.owner, gas: env.network.gasAmount});
        tf = await SKYFTeamFund.new({from: env.tests.accounts.owner, gas: env.network.gasAmount});

        token = await SKYFToken.new(
            env.development.accounts.crowdsaleWallet, 
            ndf.address, 
            env.development.accounts.communityDevelopmentWallet, 
            rf.address, 
            env.development.accounts.bountyWallet, 
            tf.address,
            env.development.accounts.siteAccount,
            {from: env.tests.accounts.owner, gas: env.network.gasAmount}
        );

        await ndf.setToken(token.address, {from: env.tests.accounts.owner, gas: env.network.gasAmount});
        await rf.setToken(token.address, {from: env.tests.accounts.owner, gas: env.network.gasAmount});
        await tf.setToken(token.address, {from: env.tests.accounts.owner, gas: env.network.gasAmount});



        crowdsale = await SKYFCrowdsale.new(
            env.development.ETHUSD,
            env.development.accounts.crowdsaleWallet,
            env.development.accounts.etherWallet,
            env.development.accounts.siteAccount,
            token.address,
            {from: env.tests.accounts.owner, gas: env.network.gasAmount}
        );

        await token.setCrowdsaleContractAddress(crowdsale.address, {from: env.tests.accounts.owner, gas: env.network.gasAmount});

        await token.approve(crowdsale.address, web3.toWei(env.crowdsaleAllowance, "mether"), {from: env.development.accounts.crowdsaleWallet, gas: env.network.gasAmount});
        await token.approve(env.development.accounts.siteAccount, web3.toWei(env.siteAccountAllowance, "mether"), {from: env.development.accounts.crowdsaleWallet, gas: env.network.gasAmount});



    });

    // START Check balances

    it("Check initial balance", async() => {
        const totalBalance = await token.totalSupply.call(
            {from: env.tests.accounts.owner, gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(totalBalance), 1200000000, "Wrong of total tokens");
    });

    it("Check crowdsale balance", async() => {
        const balance = await token.balanceOf(
            env.development.accounts.crowdsaleWallet, 
            {from: env.tests.accounts.owner, gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), 528000000, "Wrong balance of crowdsaleWallet");
    });

    it('Check networkDevelopmentWallet balance', async() => {
        const balance = await token.balanceOf(
            ndf.address, 
            {from: env.tests.accounts.owner, gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), 180000000, "Wrong balance of networkDevelopmentWallet");
    });

    it('Check communityDevelopmentWallet balance', async() => {
        const balance = await token.balanceOf(
            env.development.accounts.communityDevelopmentWallet, 
            {from: env.tests.accounts.owner, gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), 120000000, "Wrong balance of communityDevelopmentWallet");
    });

    it('Check reserveWallet balance', async() => {
        const balance = await token.balanceOf(
            rf.address,
            {from: env.tests.accounts.owner, gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), 114000000, "Wrong balance of reserveWallet");
    });

    it('Check bountyWallet balance', async() => {
        const balance = await token.balanceOf(
            env.development.accounts.bountyWallet, 
            {from: env.tests.accounts.owner, gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), 18000000, "Wrong balance of bountyWallet");
    });

    it('Check teamWallet balances', async() => {
        const balance = await token.balanceOf(
           tf.address, 
            {from: env.tests.accounts.owner, gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), 240000000, "Wrong balance of teamWallet");
    });

    // END Check balances


    // START check transfers

    it('Check transfer to user address', async() => {

        await token.transfer(
            env.tests.accounts.firstBuyerAddress, 
            web3.toWei("100", "kether"),
            {from: env.development.accounts.crowdsaleWallet, gas: env.network.gasAmount});
        
        const balance = await token.balanceOf(env.tests.accounts.firstBuyerAddress, {from: env.tests.accounts.firstBuyerAddress, gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), 100000 , "Wrong balance beneficiary wallet after transfer");
        
        const crowdsaleBalance =  await token.balanceOf(env.development.accounts.crowdsaleWallet, {from: env.development.accounts.crowdsaleWallet, gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance) + form18DecimalsTo1(crowdsaleBalance), 528000000, "Wrong wallet balance after transfer");

    });

    it('Check transfer with insufficient balance', async() => {
        var exceptionRaised = false;
        try {
            await token.transfer(
                env.tests.accounts.firstBuyerAddress
                ,web3.toWei("529", "mether"),
                {from: env.development.accounts.crowdsaleWallet, gas: env.network.gasAmount});
        }
        catch (e) {
            exceptionRaised = true;
        }
        assert.equal(exceptionRaised, true, "Missing exception");
    });

    it('Check transfer to 0 address', async() => {
        var exceptionRaised = false;
        try {
            await token.transfer(
                0
                ,web3.toWei("10", "mether"),
                {from: env.development.accounts.communityDevelopmentWallet, gas: env.network.gasAmount});
        }
        catch (e) {
            exceptionRaised = true;
        }
        assert.equal(exceptionRaised, true, "Missing exception");
    });

    // END check transfers

    // START check ERC20Allowed
    
    it('check transfer prior to crowdsale end', async() => {
        var exceptionraised = false;
        try {
            await token.transfer(
                env.tests.accounts.firstbuyeraddress
                ,web3.towei("10", "mether"),
                {from: env.development.accounts.communitydevelopmentwallet, gas: env.network.gasamount});
        }
        catch (e) {
            exceptionraised = true;
        }
        assert.equal(exceptionraised, true, "missing exception");
    });
    
    // END check ERC20Allowed
    

})