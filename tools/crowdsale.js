var SKYFToken = artifacts.require("./SKYFToken.sol");
var investors = require('./investors.0.js');

module.exports = async function(callback) {

    var fail = function(e) {
        console.log(e);
    };

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    var crowdsaleAddress = "replace with actual crowdsale wallet address";

    var token = await SKYFToken.at("replace with actual SKYFToken contract address");

    var addresses = Object.getOwnPropertyNames(investors.investor);
    for (let val of addresses ) {
        await token.transferFrom(crowdsaleAddress, val, web3.toWei(investors.investor[val], "ether")).then(function() {
            console.log("address (" + val + ") -> rate (" + investors.investor[val] + ")");
        }).catch(fail);
        await sleep(5000);
    }
    
    callback();
}
