var SKYFToken = artifacts.require("./SKYFToken.sol");
var SKYFCrowdsale = artifacts.require("./SKYFCrowdsale.sol");
var SKYFNetworkDevelopmentFund = artifacts.require("./SKYFNetworkDevelopmentFund.sol");
var SKYFReserveFund = artifacts.require("./SKYFReserveFund.sol");
var SKYFTeamFund = artifacts.require("./SKYFTeamFund.sol");
var env = require("../env.js");

module.exports = function(deployer, network) {
    var options = env[network];

    console.log("Using env for network: '" + options.name + "'");
    
    var ndfAdr, rfAdr, tfAdr, tokenAdr, crowdsaleAdr;
    deployer.deploy(SKYFNetworkDevelopmentFund).then(function() {
        ndfAdr = SKYFNetworkDevelopmentFund.address;
        return deployer.deploy(SKYFReserveFund).then(function() {
            rfAdr = SKYFReserveFund.address;
            return deployer.deploy(SKYFTeamFund).then(function() {
                tfAdr = SKYFTeamFund.address;
                return deployer.deploy(SKYFToken
                    , options.accounts.crowdsaleWallet
                    , ndfAdr
                    , options.accounts.communityDevelopmentWallet
                    , rfAdr
                    , options.accounts.bountyWallet
                    , tfAdr
                    , options.accounts.siteAccount).then(function() {
                    tokenAdr = SKYFToken.address;
                    ndf = SKYFNetworkDevelopmentFund.at(ndfAdr);
                    return ndf.setToken(tokenAdr).then(function() {
                        tf = SKYFTeamFund.at(tfAdr);
                        return tf.setToken(tokenAdr).then(function() {
                            rf = SKYFReserveFund.at(rfAdr);
                            return rf.setToken(tokenAdr).then(function () {
                                return deployer.deploy(SKYFCrowdsale
                                    , options.ETHUSD
                                    , options.accounts.crowdsaleWallet
                                    , options.accounts.etherWallet
                                    , options.accounts.siteAccount
                                    , tokenAdr).then(function() {
                                        crowdsaleAdr = SKYFCrowdsale.address;
                                        token = SKYFToken.at(tokenAdr);
                                        return token.setCrowdsaleContractAddress(crowdsaleAdr).then(function() {
                                            return token.approve(crowdsaleAdr
                                                , web3.toWei(env.crowdsaleAllowance, "mether")
                                                , {from: options.accounts.crowdsaleWallet}).then(function() {
                                                    return token.approve(options.accounts.siteAccount
                                                        , web3.toWei(env.siteAccountAllowance, "mether")
                                                        , {from: options.accounts.crowdsaleWallet})
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
