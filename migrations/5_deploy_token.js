var SKYFToken = artifacts.require("./SKYFToken.sol");
var SKYFNetworkDevelopmentFund = artifacts.require("./SKYFNetworkDevelopmentFund.sol");
var SKYFReserveFund = artifacts.require("./SKYFReserveFund.sol");
var SKYFTeamFund = artifacts.require("./SKYFTeamFund.sol");
var env = require("../env.js");

module.exports = function(deployer, network) {
    var options = env[network];

    var ndf, rf, tf;
    deployer.then(function(){
        return SKYFNetworkDevelopmentFund.deployed();    
    }).then(function(instance){
        ndf = instance;
        return SKYFReserveFund.deployed();
    }).then(function(instance){
        rf = instance;
        return SKYFTeamFund.deployed();
    }).then(function(instance){
        tf = instance;
        return deployer.deploy(SKYFToken
            , options.accounts.crowdsaleWallet
            , ndf.address
            , options.accounts.communityDevelopmentWallet
            , rf.address
            , options.accounts.bountyWallet
            , tf.address
            , options.accounts.siteAccount);
    }).catch(env.helpers.error);

    // return ndf.setToken(SKYFToken.address).then(function() {
    //     return tf.setToken(SKYFToken.address).then(function() {
    //         return rf.setToken(SKYFToken.address).catch(env.helpers.error);
    //     }).catch(env.helpers.error);
    // }).catch(env.helpers.error);
};
