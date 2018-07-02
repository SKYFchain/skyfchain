var SKYFNetworkDevelopmentFund = artifacts.require("./SKYFNetworkDevelopmentFund.sol");
var env = require("../env.js");

module.exports = function(deployer) {
    return deployer.deploy(SKYFNetworkDevelopmentFund).catch(env.helpers.error);
};
