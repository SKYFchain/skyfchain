module.exports = {
  networks: {
    mainnet: {
      mnemonic: "",
      provider: function() {
        return new HDWalletProvider(this.mnemonic, "https://mainnet.infura.io/XXXXXXXXXXXXXXX");
      },
      gas: 4700000,
      gasPrice: 30000000000,
      network_id: 1
    },
    rinkeby: {
      mnemonic: "",
      provider: function() {
        return new HDWalletProvider(this.mnemonic, "https://rinkeby.infura.io/XXXXXXXXXXXXXXX");
      },
      gas: 4700000,
      gasPrice: 30000000000,
      network_id: 4
    },
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
