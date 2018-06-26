/* jshint ignore: start */

var SKYFToken = artifacts.require("./SKYFToken.sol");
var SKYFCrowdsale = artifacts.require("./SKYFCrowdsale.sol")
var SKYFNetworkDevelopmentFund = artifacts.require("./SKYFNetworkDevelopmentFund.sol")
var SKYFReserveFund = artifacts.require("./SKYFReserveFund.sol")
var SKYFTeamFund = artifacts.require("./SKYFTeamFund.sol")
var BigNumber = require("bignumber.js");
var env = require("../env.js");

contract('SKYFToken', function() {
    let token, crowdsale, ndf, rf, tf, owner;
    let endDate = new Date(1534334400*1000);
    let shortenedAirdropDate = new Date(1534334400*1000 + 182*60*60*24*1000);
    let airdropDate = new Date(1534334400*1000 + 365*60*60*24*1000);
    let secondYearDate = new Date(1534334400*1000 + 365*2*60*60*24*1000);
    
    const totalInitial = 1200000000;
    const crowdsaleInitial = 528000000;
    const ndfInitial = 180000000;
    const cdfInitial = 120000000;
    const rfInitial = 114000000;    
    const bfInitial = 18000000;
    const tfInitial = 240000000;

    function form18DecimalsTo1(source) {
        return source.dividedBy(new BigNumber(10).pow(18)).toNumber();
    }

    // Move forward
    function quantumLeap(fromDate, toDate) {
        var dateDiff = Math.round((toDate.getTime() - fromDate.getTime())/1000)+10;
        web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [dateDiff], id: 0});
    }

    function round(value) {
        const rounder = 10000000;
        return Math.round(value*rounder)/rounder;
    }

    before(async function () {
        ndf = await SKYFNetworkDevelopmentFund.deployed();
        rf = await SKYFReserveFund.deployed();
        tf = await SKYFTeamFund.deployed();
        token = await SKYFToken.deployed();
        crowdsale = await SKYFCrowdsale.deployed();
    });

    // START Check balances

    it("Check initial balance", async() => {
        const totalBalance = await token.totalSupply.call(
            {gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(totalBalance), totalInitial, "Wrong of total tokens");
    });

    it("Check crowdsale balance", async() => {
        const balance = await token.balanceOf(
            env.development.accounts.crowdsaleWallet, 
            {gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), crowdsaleInitial, "Wrong balance of crowdsaleWallet");
    });

    it('Check networkDevelopmentWallet balance', async() => {
        const balance = await token.balanceOf(
            ndf.address, 
            {gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), ndfInitial, "Wrong balance of networkDevelopmentWallet");
    });

    it('Check communityDevelopmentWallet balance', async() => {
        const balance = await token.balanceOf(
            env.development.accounts.communityDevelopmentWallet, 
            {gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), cdfInitial, "Wrong balance of communityDevelopmentWallet");
    });

    it('Check reserveWallet balance', async() => {
        const balance = await token.balanceOf(
            rf.address,
            {gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), rfInitial, "Wrong balance of reserveWallet");
    });

    it('Check bountyWallet balance', async() => {
        const balance = await token.balanceOf(
            env.development.accounts.bountyWallet, 
            {gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), bfInitial, "Wrong balance of bountyWallet");
    });

    it('Check teamWallet balance', async() => {
        const balance = await token.balanceOf(
           tf.address, 
            {gas: env.network.gasAmount});

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
        var exRaised = false;
        try {
            await token.transfer(
                env.tests.accounts.firstBuyerAddress
                ,web3.toWei("529", "mether"),
                {from: env.development.accounts.crowdsaleWallet, gas: env.network.gasAmount});
        }
        catch (e) { exRaised = true }
        assert.equal(exRaised, true, "Missing exception");
    });

    it('Check transfer to 0 address', async() => {
        var exRaised = false;
        try {
            await token.transfer(
                0
                ,web3.toWei("10", "mether"),
                {from: env.development.accounts.communityDevelopmentWallet, gas: env.network.gasAmount});
                
                
        }
        catch (e) { exRaised = true }
        assert.equal(exRaised, true, "Missing exception");
    });

    // END check transfers


    it('Check transfer prior to crowdsale end', async() => {
        var exRaised = false;
        try {
            await token.transfer(
                env.tests.accounts.firstBuyerAddress
                ,web3.towei("10", "mether"),
                {from: env.development.accounts.communityDevelopmentWallet, gas: env.network.gasAmount});
                assert.equal(false, true, "Missing exception");
        }
        catch (e) { exRaised = true }
        assert.equal(exRaised, true, "Missing exception");
        
    });

    it('Check whitelist', async() => {
        var exRaised = false;
        try {
            await crowdsale.buyTokens(
                env.tests.accounts.thirdBuyerAddress
                , {from: env.tests.accounts.thirdBuyerAddress, value: web3.toWei("1", "ether"), gas: env.network.gasAmount});
                assert.equal(true, false, "Missing exception for non-whitelisted buyer");
        }
        catch (e) { exRaised = true }
        assert.equal(exRaised, true, "Missing exception");

        exRaised = false;

        await crowdsale.addToWhitelist(env.tests.accounts.thirdBuyerAddress, {gas: env.network.gasAmount})

        await crowdsale.buyTokens(
            env.tests.accounts.thirdBuyerAddress
            , {from: env.tests.accounts.thirdBuyerAddress, value: web3.toWei("1", "ether"), gas: env.network.gasAmount});
        

        await crowdsale.removeFromWhitelist(env.tests.accounts.thirdBuyerAddress, {gas: env.network.gasAmount})
        try {
            await crowdsale.buyTokens(
                env.tests.accounts.thirdBuyerAddress
                , {from: env.tests.accounts.thirdBuyerAddress, value: web3.toWei("1", "ether"), gas: env.network.gasAmount});
        } catch (e) { exRaised = true }
        assert.equal(exRaised, true, "Missing exception");
    });

    //BEGIN airdrop
    it('Create airdrop', async() => {
        var initialAllowance = await token.allowance(
            env.development.accounts.crowdsaleWallet,
            crowdsale.address,
            {gas: env.network.gasAmount});

        await crowdsale.createAirdrop(
            env.tests.accounts.firstAirdropAddress
            , web3.toWei("100", "kether")
            , {gas: env.network.gasAmount});

        var currentAllowance = await token.allowance(
            env.development.accounts.crowdsaleWallet,
            crowdsale.address,
            {gas: env.network.gasAmount});
        
        assert.equal(form18DecimalsTo1(initialAllowance)-form18DecimalsTo1(currentAllowance), 100000, "Wrong allowance change")

        const balance = await token.balanceOf(env.tests.accounts.firstAirdropAddress, {gas: env.network.gasAmount});

        assert.equal(form18DecimalsTo1(balance), 100000, "Wrong balance")
    
        //check for whitelist
        await crowdsale.buyTokens(
             env.tests.accounts.firstAirdropAddress
             , {from: env.tests.accounts.fourthAirdropAddress, value: web3.toWei("1", "ether"), gas: env.network.gasAmount});

        //check isAirdrop
        const isAirdrop = await token.isAirdrop(env.tests.accounts.firstAirdropAddress, {gas: env.network.gasAmount});
        assert.equal(isAirdrop, true, "Not added to airdrop");
    });

    it('Create airdrop from site account', async() => {
        var initialAllowance = await token.allowance(
            env.development.accounts.crowdsaleWallet,
            env.development.accounts.siteAccount,
            {gas: env.network.gasAmount});

        await crowdsale.createAirdrop(
            env.tests.accounts.secondAirdropAddress
            , web3.toWei("100", "kether")
            , {from: env.development.accounts.siteAccount, gas: env.network.gasAmount});

        var currentAllowance = await token.allowance(
            env.development.accounts.crowdsaleWallet,
            env.development.accounts.siteAccount,
            {gas: env.network.gasAmount});
        
        assert.equal(form18DecimalsTo1(initialAllowance)-form18DecimalsTo1(currentAllowance), 100000, "Wrong allowance change")

        //shorten airdrop
        await crowdsale.buyTokens(
            env.tests.accounts.secondAirdropAddress
            , {from: env.tests.accounts.secondAirdropAddress, value: web3.toWei("10", "ether"), gas: env.network.gasAmount});
    });

    it('Create airdrop and pay 3x extra', async() => {
        await crowdsale.createAirdrop(
            env.tests.accounts.thirdAirdropAddress
            , web3.toWei("100", "kether")
            , {gas: env.network.gasAmount});

        //leave airdrop list
        await crowdsale.buyTokens(
            env.tests.accounts.thirdAirdropAddress
             , {from: env.tests.accounts.thirdAirdropAddress, value: web3.toWei("30", "ether"), gas: env.network.gasAmount});

        const isAirdrop = await token.isAirdrop(env.tests.accounts.thirdAirdropAddress, {gas: env.network.gasAmount});
        assert.equal(isAirdrop, false, "Not removed from airdrop");
 
    });

    it('Create airdrop and pay 3x extra in 2 steps', async() => {
        await crowdsale.createAirdrop(
            env.tests.accounts.fourthAirdropAddress
            , web3.toWei("100", "kether")
            , {gas: env.network.gasAmount});

        //to shortened airdrop list
        await crowdsale.buyTokens(
            env.tests.accounts.fourthAirdropAddress
             , {from: env.tests.accounts.fourthAirdropAddress, value: web3.toWei("20", "ether"), gas: env.network.gasAmount});

        var isAirdrop = await token.isAirdrop(env.tests.accounts.fourthAirdropAddress, {gas: env.network.gasAmount});
        assert.equal(isAirdrop, true, "Removed from airdrop");

        //remove from airdrop list
        await crowdsale.buyTokens(
            env.tests.accounts.fourthAirdropAddress
             , {from: env.tests.accounts.fourthAirdropAddress, value: web3.toWei("15", "ether"), gas: env.network.gasAmount});

        isAirdrop = await token.isAirdrop(env.tests.accounts.fourthAirdropAddress, {gas: env.network.gasAmount});
        assert.equal(isAirdrop, false, "Not removed from airdrop");
 
    });

    //END Airdrop

    it('Check set rate', async() => {
        await crowdsale.setRate(32500, {gas: env.network.gasAmount});
        await crowdsale.addToWhitelist(env.tests.accounts.secondBuyerAddress, {gas: env.network.gasAmount});

        const startBalance = await token.balanceOf(env.tests.accounts.secondBuyerAddress, {gas: env.network.gasAmount});
        await crowdsale.buyTokens(
            env.tests.accounts.secondBuyerAddress
             , {from: env.tests.accounts.secondBuyerAddress, value: web3.toWei("1", "ether"), gas: env.network.gasAmount});

        const endBalance = await token.balanceOf(env.tests.accounts.secondBuyerAddress, {gas: env.network.gasAmount});
        
        assert.equal(form18DecimalsTo1(endBalance)-form18DecimalsTo1(startBalance), 5000, "Balance does not match");

        await crowdsale.setRate(env.development.ETHUSD, {gas: env.network.gasAmount});
    });
    

    it('Check set price', async() => {
        await crowdsale.setPrice(web3.toWei("130", "finney"), {gas: env.network.gasAmount});

        const startBalance = await token.balanceOf(env.tests.accounts.secondBuyerAddress, {gas: env.network.gasAmount});
        await crowdsale.buyTokens(
            env.tests.accounts.secondBuyerAddress
             , {from: env.tests.accounts.secondBuyerAddress, value: web3.toWei("1", "ether"), gas: env.network.gasAmount});

        const endBalance = await token.balanceOf(env.tests.accounts.secondBuyerAddress, {gas: env.network.gasAmount});
        
        assert.equal(form18DecimalsTo1(endBalance)-form18DecimalsTo1(startBalance), 5000, "Balance does not match");

        await crowdsale.setPrice(web3.toWei("65", "finney"), {gas: env.network.gasAmount});
    });
    

    it('Check transfer of ether', async() => {
        const startBalance = await web3.eth.getBalance(env.development.accounts.etherWallet);
        
        await crowdsale.buyTokens(
             env.tests.accounts.secondBuyerAddress
             , {from: env.tests.accounts.secondBuyerAddress, value: web3.toWei("1", "ether"), gas: env.network.gasAmount});
        
        const endBalance = await web3.eth.getBalance(env.development.accounts.etherWallet);
        
        assert.equal(form18DecimalsTo1(endBalance)-form18DecimalsTo1(startBalance), 1, "Wrong ether wallet balance");

    });


    it('Finalize before end time', async() => {
        var exRaised = false;
        try {
            await crowdsale.finalize({gas: env.network.gasAmount});
            
        }
        catch (e) { exRaised = true; }
        assert.equal(exRaised, true, "Missing exception");
    });


    // START OtherFunds
    it('Check NDF is not available', async() => {
        var exRaised = false;
        try {
            await ndf.transfer(
            env.tests.accounts.firstBuyerAddress
            , web3.toWei("1", "ether")
            , {gas: env.network.gasAmount});
        }
        catch (e) { exRaised = true; }
        assert.equal(exRaised, true, "Missing exception");
    });
    // END OtherFunds

        
    it('Move time and check notEnded modifier', async() => {
        quantumLeap(new Date(), endDate);

        var exRaised = false;
        try {
            await crowdsale.buyTokens(
            env.tests.accounts.firstAirdropAddress
            , {from: env.tests.accounts.firstAirdropAddress, value: web3.toWei("1", "ether"), gas: env.network.gasAmount});

        }
        catch (e) { exRaised = true; }
        assert.equal(exRaised, true, "Missing exception");
    });

    


    it('Finalize', async() => {
        //Check that contract exists
        await crowdsale.rate.call({gas: env.network.gasAmount});

        
        await crowdsale.finalize({gas: env.network.gasAmount});

        var exRaised = false;
        //Check that contract is killed
        try {
            await crowdsale.rate.call({gas: env.network.gasAmount});
        }
        catch (e) { exRaised = true; }
        assert.equal(exRaised, true, "Missing exception");
    });



    it('Check finalization', async() => {
        var percentageToLeave = (
            100000 //firstBuyer
            +20000 //secondBuyer
            +10000 //thirdBuyer
            +110000 //firstAirdrop
            +200000 //secondAirdrop
            +400000 //thirdAirdrop
            +450000 //fourthAirdrop
        )/crowdsaleInitial;
        
        const totalSupply = await token.totalSupply({gas: env.network.gasAmount});
        assert.equal(round(form18DecimalsTo1(totalSupply)), round(totalInitial*percentageToLeave), "Wrong number of total tokens");

        const crowdsaleBalance = await token.balanceOf(env.development.accounts.crowdsaleWallet, {gas: env.network.gasAmount});
        assert.equal(form18DecimalsTo1(crowdsaleBalance), 0, "Wrong crowdsale balance");

        const ndfBalance = await token.balanceOf(ndf.address, {gas: env.network.gasAmount});
        assert.equal(round(form18DecimalsTo1(ndfBalance)), round(ndfInitial*percentageToLeave), "Wrong NDF balance");

        const cdfBalance = await token.balanceOf(env.development.accounts.communityDevelopmentWallet, {gas: env.network.gasAmount});
        assert.equal(round(form18DecimalsTo1(cdfBalance)), round(cdfInitial*percentageToLeave), "Wrong CDF balance");

        const rfBalance = await token.balanceOf(rf.address, {gas: env.network.gasAmount});
        assert.equal(round(form18DecimalsTo1(rfBalance)), round(rfInitial*percentageToLeave), "Wrong RF balance");

        const bfBalance = await token.balanceOf(env.development.accounts.bountyWallet, {gas: env.network.gasAmount});
        assert.equal(round(form18DecimalsTo1(bfBalance)), round(bfInitial*percentageToLeave), "Wrong BF balance");

        const tfBalance = await token.balanceOf(tf.address, {gas: env.network.gasAmount});
        assert.equal(round(form18DecimalsTo1(tfBalance)), round(tfInitial*percentageToLeave), "Wrong TF balance");
    });
    

    //START transferFrom

    it('Check transfer from one address to another address', async() => {

        var appr = await token.approve(
            env.tests.accounts.secondBuyerAddress, 
            web3.toWei("10", "kether"),
            {from: env.tests.accounts.firstBuyerAddress, gas: env.network.gasAmount}
        );

        var allowance = await token.allowance.call(
            env.tests.accounts.firstBuyerAddress
            , env.tests.accounts.secondBuyerAddress
            , {from: env.tests.accounts.secondBuyerAddress, gas: env.network.gasAmount});
        assert.equal(form18DecimalsTo1(allowance), 10000, "Wrong allowance");

        const balanceToBefore = await token.balanceOf(
            env.tests.accounts.secondBuyerAddress, 
            {from: env.tests.accounts.secondBuyerAddress, gas: env.network.gasAmount}
        );

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
        assert.equal(form18DecimalsTo1(balanceTo)-form18DecimalsTo1(balanceToBefore), 10000 , "Wrong balance recipient wallet after transfer");

    });

    it('Check transfer from one address to 0 address', async() => {
        var appr = await token.approve(
            env.tests.accounts.secondBuyerAddress, 
            web3.toWei("10", "kether"),
            {from: env.tests.accounts.firstBuyerAddress, gas: env.network.gasAmount}
        );

        var allowance = await token.allowance.call(
            env.tests.accounts.firstBuyerAddress
            , env.tests.accounts.secondBuyerAddress
            , {from: env.tests.accounts.secondBuyerAddress, gas: env.network.gasAmount});
        assert.equal(form18DecimalsTo1(allowance), 10000, "Wrong allowance");

        
        var exRaised = false;
        try {
            await token.transferFrom(
                env.tests.accounts.firstBuyerAddress,
                0, 
                web3.toWei("10", "kether"),
                {from: env.tests.accounts.secondBuyerAddress, gas: env.network.gasAmount}
            );
        }
        catch (e) {exRaised = true}
        assert.equal(exRaised, true, "Missing exception");
    });

    it('Check transfer from one address to another address with insufficient balance', async() => {
        var appr = await token.approve(
            env.tests.accounts.secondBuyerAddress, 
            web3.toWei("10", "kether"),
            {from: env.tests.accounts.firstBuyerAddress, gas: env.network.gasAmount}
        );

        var allowance = await token.allowance.call(
            env.tests.accounts.firstBuyerAddress
            , env.tests.accounts.secondBuyerAddress
            , {from: env.tests.accounts.secondBuyerAddress, gas: env.network.gasAmount});
        assert.equal(form18DecimalsTo1(allowance), 10000, "Wrong allowance");
        
        var exRaised = false;
        try {
            await token.transferFrom(
                env.tests.accounts.firstBuyerAddress,
                env.tests.accounts.secondBuyerAddress, 
                web3.toWei("529", "mether"),
                {from: env.tests.accounts.secondBuyerAddress, gas: env.network.gasAmount}
            );
        }
        catch (e) {exRaised = true}
        assert.equal(exRaised, true, "Missing exception");

    });

    //END transferForm

    //BEGIN Airdrop

    it('Check airdrop transfer is not allowed yet', async() => {
        var exRaised = false;
        try {
            await token.transfer(
                env.tests.accounts.firstBuyerAddress, 
                web3.toWei("1", "ether"),
                {from: env.tests.accounts.firstAirdropAddress, gas: env.network.gasAmount});
        }
        catch (e) {exRaised = true}
        assert.equal(exRaised, true, "Missing exception");

    });

     it('Check shortened airdrop transfer is not allowed yet', async() => {
        var exRaised = false;
        try {
            await token.transfer(
                env.tests.accounts.firstBuyerAddress, 
                web3.toWei("1", "ether"),
                {from: env.tests.accounts.secondAirdropAddress, gas: env.network.gasAmount});
        }
        catch (e) {exRaised = true}
        assert.equal(exRaised, true, "Missing exception");
        
    });

    it('Check removed from airdrop transfer is allowed', async() => {
        await token.transfer(
                env.tests.accounts.firstBuyerAddress, 
                web3.toWei("1", "ether"),
               {from: env.tests.accounts.thirdAirdropAddress, gas: env.network.gasAmount});
    });

    it('Check transfer to airdrop is not allowed yet', async() => {
        var exRaised = false;
        try {
            await token.transfer(
                env.tests.accounts.secondAirdropAddress, 
                web3.toWei("1", "ether"),
                {from: env.tests.accounts.thirdAirdropAddress, gas: env.network.gasAmount});
        }
        catch (e) {exRaised = true}
        assert.equal(exRaised, true, "Missing exception");
        
    });

    it('Check transferFrom to airdrop is not allowed yet', async() => {
        var exRaised = false;
        try {
            await token.transferFrom(
                env.tests.accounts.firstBuyerAddress,
                env.tests.accounts.secondAirdropAddress, 
                web3.toWei("1", "ether"),
                {from: env.tests.accounts.secondBuyerAddress, gas: env.network.gasAmount});
        }
        catch (e) {exRaised = true}
        assert.equal(exRaised, true, "Missing exception");
        
    });

    // END Airdrop

    // START OtherFunds
    it('Check NDF is only 50% available', async() => {
        const ndfBalance = await token.balanceOf(ndf.address, {gas: env.network.gasAmount});
        await ndf.transfer(
            env.tests.accounts.firstBuyerAddress
            , ndfBalance/2
            , {gas: env.network.gasAmount}); 


        var exRaised = false;
        try {
            await ndf.transfer(
            env.tests.accounts.firstBuyerAddress
            , web3.toWei("1", "ether")
            , {gas: env.network.gasAmount});
        }
        catch (e) { exRaised = true; }
        assert.equal(exRaised, true, "Missing exception");
    });
    // END OtherFunds

    // START Airdrop
    it('Check shortened airdrop transfer after 182 days', async() => {

        quantumLeap(endDate, shortenedAirdropDate);

        await token.transfer(
            env.tests.accounts.firstBuyerAddress,
            web3.toWei("1", "ether"),
            {from: env.tests.accounts.secondAirdropAddress, gas: env.network.gasAmount});
    });

    it('Check airdrop transfer after 182 days', async() => {
        var exRaised = false;
        try {
            await token.transfer(
                env.tests.accounts.firstBuyerAddress,
                web3.toWei("1", "ether"),
                {from: env.tests.accounts.firstAirdropAddress, gas: env.network.gasAmount});
        }
        catch (e) {exRaised = true}
        assert.equal(exRaised, true, "Missing exception");
    });

    // END Airdrop

    // START OtherFunds
    it('Check NDF is only 50% available', async() => {
        var exRaised = false;
        try {
            await ndf.transfer(
            env.tests.accounts.firstBuyerAddress
            , web3.toWei("1", "ether")
            , {gas: env.network.gasAmount});
        }
        catch (e) { exRaised = true; }
        assert.equal(exRaised, true, "Missing exception");
    });

    it('Check RF is not available yet', async() => {
        var exRaised = false;
        try {
            await rf.transfer(
            env.tests.accounts.firstBuyerAddress
            , web3.toWei("1", "ether")
            , {gas: env.network.gasAmount});
        }
        catch (e) { exRaised = true; }
        assert.equal(exRaised, true, "Missing exception");
    });
    
    it('Check TF is not available yet', async() => {
        var exRaised = false;
        try {
            await tsf.transfer(
            env.tests.accounts.firstBuyerAddress
            , web3.toWei("1", "ether")
            , {gas: env.network.gasAmount});
        }
        catch (e) { exRaised = true; }
        assert.equal(exRaised, true, "Missing exception");
    });

    // END OtherFunds

    // START Airdrop
    it('Check airdrop transfer after 365 days', async() => {

        quantumLeap(shortenedAirdropDate, airdropDate);

        await token.transfer(
            env.tests.accounts.firstBuyerAddress,
            web3.toWei("1", "ether"),
            {from: env.tests.accounts.firstAirdropAddress, gas: env.network.gasAmount});
    });
    // END Airdrop

    // START OtherFunds
    it('Check NDF is only 85% available', async() => {
        const ndfBalance = await token.balanceOf(ndf.address, {gas: env.network.gasAmount});
        await ndf.transfer(
            env.tests.accounts.firstBuyerAddress
            , ndfBalance*7/10//70% of 50% that left
            , {gas: env.network.gasAmount}); 


        var exRaised = false;
        try {
            await ndf.transfer(
            env.tests.accounts.firstBuyerAddress
            , web3.toWei("1", "ether")
            , {gas: env.network.gasAmount});
        }
        catch (e) { exRaised = true; }
        assert.equal(exRaised, true, "Missing exception");
    });

    
    it('Check RF is available', async() => {
        await rf.transfer(
        env.tests.accounts.firstBuyerAddress
        , web3.toWei("1", "ether")
        , {gas: env.network.gasAmount});
    });

    it('Check TF is available', async() => {
        await rf.transfer(
        env.tests.accounts.firstBuyerAddress
        , web3.toWei("1", "ether")
        , {gas: env.network.gasAmount});
    });

    it('Check 100% of NDF is avaliable', async() => {
        quantumLeap(airdropDate, secondYearDate);

        const ndfBalance = await token.balanceOf(ndf.address, {gas: env.network.gasAmount});
        await ndf.transfer(
            env.tests.accounts.firstBuyerAddress
            , ndfBalance//all what is left
            , {gas: env.network.gasAmount}); 
    });

    // END OtherFunds
})