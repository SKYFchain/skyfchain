var SKYFToken = artifacts.require("./SKYFToken.sol");
var investors = require('./investors.0.js');
var util = require("util");

module.exports = async function(callback) {

    var fail = function(e) {
        console.log(e);
    };

    var token = await SKYFToken.deployed()

    var addresses = Object.getOwnPropertyNames(investors.investor);
    for (let val of addresses ) {
        await token.addAirdrop(val, web3.toWei(investors.investor[val], "ether")).then(function() {
            console.log("address (" + val + ") -> rate (" + investors.investor[val] + ")");
        }).catch(fail);
    }
    
    callback();
}