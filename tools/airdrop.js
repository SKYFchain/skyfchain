var SKYFToken = artifacts.require("./SKYFToken.sol");
var investors = require('./investors.0.js');

module.exports = async function(callback) {

    var fail = function(e) {
        console.log(e);
    };

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    var token = await SKYFToken.at("0xbe4c3eBf48154bd7385D332F846baa421c499027");

    var addresses = Object.getOwnPropertyNames(investors.investor);
    for (let val of addresses ) {
        await token.addAirdrop(val, web3.toWei(investors.investor[val], "ether")).then(function() {
            console.log("address (" + val + ") -> rate (" + investors.investor[val] + ")");
        }).catch(fail);
        await sleep(5000);
    }
    
    callback();
}