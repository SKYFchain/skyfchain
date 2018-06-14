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
    let endDate = new Date(1534334400*1000);

    const totalInitial = 1200000000;
    const crowdsaleInitial = 528000000;
    const ndfInitial = 180000000;
    const cdfInitial = 120000000;
    const rfInitial = 114000000;    
    const bfInitial = 18000000;
    const tfInitial = 240000000;

    const crowdsaleAllowance = 400000000;
    const siteAccountAllowance = 128000000;

    function form18DecimalsTo1(source) {
        return source.dividedBy(new BigNumber(10).pow(18)).toNumber();
    }

    // Move forward
    function quantumLeap(toDate) {
        var date = new Date();
        var dateDiff = toDate.getTime() - date.getTime();
        web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [dateDiff], id: 0});
    }



    before(async function () {
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

    // START Finalize time not come yet
    // START Check balances

    it("Check initial balance", async() => {
        const totalBalance = await token.totalSupply.call(
            {from: env.tests.accounts.owner, gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(totalBalance), totalInitial, "Wrong of total tokens");
    });

    it("Check crowdsale balance", async() => {
        const balance = await token.balanceOf(
            env.development.accounts.crowdsaleWallet, 
            {from: env.tests.accounts.owner, gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), crowdsaleInitial, "Wrong balance of crowdsaleWallet");
    });

    it('Check networkDevelopmentWallet balance', async() => {
        const balance = await token.balanceOf(
            ndf.address, 
            {from: env.tests.accounts.owner, gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), ndfInitial, "Wrong balance of networkDevelopmentWallet");
    });

    it('Check communityDevelopmentWallet balance', async() => {
        const balance = await token.balanceOf(
            env.development.accounts.communityDevelopmentWallet, 
            {from: env.tests.accounts.owner, gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), cdfInitial, "Wrong balance of communityDevelopmentWallet");
    });

    it('Check reserveWallet balance', async() => {
        const balance = await token.balanceOf(
            rf.address,
            {from: env.tests.accounts.owner, gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), rfInitial, "Wrong balance of reserveWallet");
    });

    it('Check bountyWallet balance', async() => {
        const balance = await token.balanceOf(
            env.development.accounts.bountyWallet, 
            {from: env.tests.accounts.owner, gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), bfInitial, "Wrong balance of bountyWallet");
    });

    it('Check teamWallet balance', async() => {
        const balance = await token.balanceOf(
           tf.address, 
            {from: env.tests.accounts.owner, gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), tfInitial, "Wrong balance of teamWallet");
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

        assert.equal(form18DecimalsTo1(crowdsaleBalance), crowdsaleInitial-100000, "Wrong wallet balance after transfer");

    });

    it('Check transfer with insufficient balance', async() => {
        try {
            await token.transfer(
                env.tests.accounts.firstBuyerAddress
                ,web3.toWei("529", "mether"),
                {from: env.development.accounts.crowdsaleWallet, gas: env.network.gasAmount});
            assert.equal(false, true, "Missing exception");
        }
        catch (e) { }
    });

    it('Check transfer to 0 address', async() => {
        try {
            await token.transfer(
                0
                ,web3.toWei("10", "mether"),
                {from: env.development.accounts.communityDevelopmentWallet, gas: env.network.gasAmount});
                assert.equal(false, true, "Missing exception");
                
        }
        catch (e) {}
    });

    // END check transfers


    // START check ERC20Allowed
    
    it('Check transfer prior to crowdsale end', async() => {
        try {
            await token.transfer(
                env.tests.accounts.firstBuyerAddress
                ,web3.towei("10", "mether"),
                {from: env.development.accounts.communityDevelopmentWallet, gas: env.network.gasAmount});
                assert.equal(false, true, "Missing exception");
        }
        catch (e) {
        }
        
    });

    

    it('Finalize before end time', async() => {
        try {
            await crowdsale.finalize({from: env.tests.accounts.owner, gas: env.network.gasAmount});
            assert.equal(true,false, "Missing exception");
        }
        catch (e) {}
    });
    
    //END Finalize time not come yet    
    it('Finalize after end time', async() => {
        //Check that contract exists
        await crowdsale.rate.call({from: env.tests.accounts.owner, gas: env.network.gasAmount});

        quantumLeap(endDate);
        await crowdsale.finalize({from: env.tests.accounts.owner, gas: env.network.gasAmount});

        //Check that contract is killed
        try {
            await crowdsale.rate.call({from: env.tests.accounts.owner, gas: env.network.gasAmount});
            assert.equal(true,false, "Missing exception");
        }
        catch (e) {}
    });

    
    //BEGIN Balances after finalization
    it('Check finalization', async() => {
        var percentageToLeave = (
            100000
            +0
        )/crowdsaleInitial;
        
        const totalSupply = await token.totalSupply({from: env.tests.accounts.owner, gas: env.network.gasAmount});
        assert.equal(form18DecimalsTo1(totalSupply), totalInitial*percentageToLeave, "Wrong number of total tokens");

        const crowdsaleBalance = await token.balanceOf(env.development.accounts.crowdsaleWallet, {from: env.tests.accounts.owner, gas: env.network.gasAmount});
        assert.equal(form18DecimalsTo1(crowdsaleBalance), 0, "Wrong crowdsale balance");

        const ndfBalance = await token.balanceOf(ndf.address, {from: env.tests.accounts.owner, gas: env.network.gasAmount});
        assert.equal(form18DecimalsTo1(ndfBalance), ndfInitial*percentageToLeave, "Wrong NDF balance");

        const cdfBalance = await token.balanceOf(env.development.accounts.communityDevelopmentWallet, {from: env.tests.accounts.owner, gas: env.network.gasAmount});
        assert.equal(form18DecimalsTo1(cdfBalance), cdfInitial*percentageToLeave, "Wrong CDF balance");

        const rfBalance = await token.balanceOf(rf.address, {from: env.tests.accounts.owner, gas: env.network.gasAmount});
        assert.equal(form18DecimalsTo1(rfBalance), rfInitial*percentageToLeave, "Wrong RF balance");

        const bfBalance = await token.balanceOf(env.development.accounts.bountyWallet, {from: env.tests.accounts.owner, gas: env.network.gasAmount});
        assert.equal(form18DecimalsTo1(bfBalance), bfInitial*percentageToLeave, "Wrong BF balance");

        const tfBalance = await token.balanceOf(tf.address, {from: env.tests.accounts.owner, gas: env.network.gasAmount});
        assert.equal(form18DecimalsTo1(tfBalance), tfInitial*percentageToLeave, "Wrong TF balance");
    });
    
    //END After finalization

    //START transferFrom

    it('Check transfer from one address to another address', async() => {

        var appr = await token.approve(
            env.tests.accounts.secondBuyerAddress, 
            web3.toWei("10", "kether"),
            {from: env.tests.accounts.firstBuyerAddress, gas: env.network.gasAmount}
        );

        //assert.equal(appr, true, "Approve false");

        var allowance = await token.allowance.call(
            env.tests.accounts.firstBuyerAddress
            , env.tests.accounts.secondBuyerAddress
            , {from: env.tests.accounts.secondBuyerAddress, gas: env.network.gasAmount});
        assert.equal(form18DecimalsTo1(allowance), 10000, "Wrong allowance");

        await token.transferFrom(
            env.tests.accounts.firstBuyerAddress,
            env.tests.accounts.secondBuyerAddress, 
            web3.toWei("10", "kether"),
            {from: env.tests.accounts.secondBuyerAddress, gas: env.network.gasAmount}
        );

        const balanceFrom = await token.balanceOf(
            env.tests.accounts.firstBuyerAddress, 
            {from: env.tests.accounts.firstBuyerAddress, gas: env.network.gasAmount}
        );
        
        const balanceTo = await token.balanceOf(
            env.tests.accounts.secondBuyerAddress, 
            {from: env.tests.accounts.secondBuyerAddress, gas: env.network.gasAmount}
        );

        assert.equal(form18DecimalsTo1(balanceFrom), 90000 , "Wrong balance beneficiary wallet after transfer");
        assert.equal(form18DecimalsTo1(balanceTo), 10000 , "Wrong balance recipient wallet after transfer");

    });

    //END transferForm

})