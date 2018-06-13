module.exports = {
  networks: {
    // ropsten: {
    //   mnemonic: "",
    //   provider: function() {
    //     return new HDWalletProvider(this.mnemonic, "https://ropsten.infura.io/h8ZokIdf0xBaw51kqbUc", 1);
    //   },
    //   gas: 4700000,
    //   gasPrice: 30000000000,
    //   network_id: 3
    // },
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
