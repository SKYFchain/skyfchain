var SKYFTeamFund = artifacts.require("./SKYFTeamFund.sol");
var env = require("../env.js");

module.exports = function(deployer) {
    return deployer.deploy(SKYFTeamFund).catch(env.helpers.error);
};
