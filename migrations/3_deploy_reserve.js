var SKYFReserveFund = artifacts.require("./SKYFReserveFund.sol");
var env = require("../env.js");

module.exports = function(deployer) {
    return deployer.deploy(SKYFReserveFund).catch(env.helpers.error);
};
