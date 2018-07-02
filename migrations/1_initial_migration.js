var Migrations = artifacts.require("./Migrations.sol");
var env = require("../env.js");

module.exports = function(deployer, network) {
  var options = env[network];
  console.log("Using env for network: '" + options.name + "'");

  deployer.deploy(Migrations);
};
