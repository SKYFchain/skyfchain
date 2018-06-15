/* jshint esversion: 6 */

var Ganache = require("ganache-core");
const createKeccakHash = require('keccak');
const BigNumber = require('bignumber.js');
const port = 8545;

let options = {
    mnemonic: "web life name funny sunset nut feed machine object bag saddle deposit",
    logger: console,
    total_accounts: 12
};

let server = Ganache.server(options);

function fromHexToDecimal(hex) {
    let hexStr = hex.toString("hex");
    if (hexStr == "") {
        return 0;
    }
    let decimal = new BigNumber("0x" + hex.toString("hex"), 16);
    return decimal.dividedBy(new BigNumber(10).pow(18)).toNumber();
}

function toChecksumAddress (address) {
    address = address.toLowerCase().replace('0x','');
    var hash = createKeccakHash('keccak256').update(address).digest('hex');
    var ret = '0x';

    for (var i = 0; i < address.length; i++) {
        if (parseInt(hash[i], 16) >= 8) {
            ret += address[i].toUpperCase();
        } else {
            ret += address[i];
        }
    }

    return ret;
}

server.listen(port, function(err, blockchain) {
    if (err) {
        console.log(err);
        return;
    }

    var state = blockchain ? blockchain : server.provider.manager.state;

    console.log("");
    console.log("Available Accounts");
    console.log("==================");

    var accounts = state.accounts;
    var addresses = Object.keys(accounts);

    addresses.forEach(function(address, index) {
        var addressLine = "    🤖  " + address;

        if (state.isUnlocked(address) == false) {
            addressLine += " 🔒";
        }

        var normalizedAddressLine = "(" + index + ") 🤓  " + toChecksumAddress(address);
        var privateKeyLine = "    🔑  0x" + accounts[address].secretKey.toString("hex");
        var balanceLine = "    💰  " + fromHexToDecimal(accounts[address].account.balance) + " ether";

        console.log(normalizedAddressLine);
        console.log(addressLine);
        console.log(privateKeyLine);
        console.log(balanceLine);
        console.log();
    });

    console.log("");
    console.log("Listening on localhost:" + port);
    console.log("===========================");
    console.log("");
});

process.on('uncaughtException', function(e) {
    console.log(e.stack);
    process.exit(1);
});

process.on("SIGINT", function () {
    // graceful shutdown
    server.close(function(err) {
        if (err) {
            console.log(err.stack || err);
        }
        process.exit();
    });
});