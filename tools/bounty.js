var SKYFToken = artifacts.require("./SKYFToken.sol");
var investors = require('./investors.0.js');

module.exports = async function(callback) {

    var fail = function(e) {
        console.log(e);
    };

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    
    var token = await SKYFToken.at("0x5dd0815a4cf119ad91ba045bbbf879f3f7de3c68");

    var addresses = Object.getOwnPropertyNames(investors.investor);
    for (let val of addresses ) {
        await token.transfer(val, web3.toWei(investors.investor[val], "ether")).then(function() {
            console.log("address (" + val + ") -> rate (" + investors.investor[val] + ")");
        }).catch(fail);
        await sleep(5000);
    }
    
    callback();
}
