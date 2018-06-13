module.exports = {
    network: {
        gasAmount: 4000000
    },
    siteAccountAllowance: 128,
    crowdsaleAllowance: 400,
    development: {
        name: "Development network account",
        accounts: {
            crowdsaleWallet: "0xb49fbbd01D8fF9a2bF46B7E4cB31CF8b8CFB96A9", // testrpc
            communityDevelopmentWallet: "0x995d3876d03CeC2Ae2Dc79dC29E066C9C0A1fBF8", // testrpc
            bountyWallet: "0x6aEeE7E0088C067641f8E5a8B83003a7040C65e5", // testrpc
            siteAccount: "0x9dD1c94058c51E1A24c4598B1071fDcaf908205F", // testrpc
            etherWallet: "0x6AB20252Cc8fe103949ef6500C8e27f5c194375C" // testrpc
        },
        ETHUSD: 47518 //10^-2
    },
    tests: {
        name: "Development network account",
        accounts: {
            owner: "0x156419fc32aB83B78421d3881397c2167A5FA552",
            firstBuyerAddress: "0xb0715271307d9749E7E12Ce3ec66091F033f3240",
            secondBuyerAddress: "0x57f856B7314A73478FC01fbc76B92D4F2c2579bf"
        },
        ETHUSD: 475
    }
}