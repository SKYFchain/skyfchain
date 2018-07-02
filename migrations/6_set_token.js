var SKYFToken = artifacts.require("./SKYFToken.sol");
var SKYFNetworkDevelopmentFund = artifacts.require("./SKYFNetworkDevelopmentFund.sol");
var SKYFReserveFund = artifacts.require("./SKYFReserveFund.sol");
var SKYFTeamFund = artifacts.require("./SKYFTeamFund.sol");
var env = require("../env.js");

module.exports = function(deployer) {
    var ndf, rf, tf, token;
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
        return SKYFToken.deployed();
    }).then(function(instance){
        token = instance;
        return ndf.setToken(token.address);
    }).then(function(){
        return rf.setToken(token.address);
    }).then(function(){
        return tf.setToken(token.address);
    }).catch(env.helpers.error);
};
