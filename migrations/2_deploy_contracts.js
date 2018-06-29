var SKYFToken = artifacts.require("./SKYFToken.sol");
var SKYFNetworkDevelopmentFund = artifacts.require("./SKYFNetworkDevelopmentFund.sol");
var SKYFReserveFund = artifacts.require("./SKYFReserveFund.sol");
var SKYFTeamFund = artifacts.require("./SKYFTeamFund.sol");
var env = require("../env.js");

module.exports = function(deployer, network) {
    var options = env[network];

    console.log("Using env for network: '" + options.name + "'");
    
    var ndfAddr, rfAddr, tfAddr, tokenAddr;
    deployer.deploy(SKYFNetworkDevelopmentFund).then(function() {
        ndfAddr = SKYFNetworkDevelopmentFund.address;
        return deployer.deploy(SKYFReserveFund).then(function() {
            rfAddr = SKYFReserveFund.address;
            return deployer.deploy(SKYFTeamFund).then(function() {
                tfAddr = SKYFTeamFund.address;
                return deployer.deploy(SKYFToken
                    , options.accounts.crowdsaleWallet
                    , ndfAddr
                    , options.accounts.communityDevelopmentWallet
                    , rfAddr
                    , options.accounts.bountyWallet
                    , tfAddr
                    , options.accounts.siteAccount).then(function() {
                    tokenAddr = SKYFToken.address;
                    ndf = SKYFNetworkDevelopmentFund.at(ndfAddr);
                    return ndf.setToken(tokenAddr).then(function() {
                        tf = SKYFTeamFund.at(tfAddr);
                        return tf.setToken(tokenAddr).then(function() {
                            rf = SKYFReserveFund.at(rfAddr);
                            return rf.setToken(tokenAddr).catch(function(e) {
                                console.error(e);
                            })
                        }).catch(function(e) {
                            console.error(e);
                        })
                    }).catch(function(e) {
                        console.error(e);
                    })
                }).catch(function(e) {
                    console.error(e);
                })
            }).catch(function(e) {
                console.error(e);
            })
        }).catch(function(e) {
            console.error(e);
        })
    }).catch(function(e) {
        console.error(e);
    });



};
