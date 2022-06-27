const { task } = require("hardhat/config")

task("balance", "Prints the list of accounts")
    .addParam("account", "The account's address")
    .setAction(async (taskArgs, hre) => {
        const balance = await hre.ethers.provider.getBalance(taskArgs.account)

        console.log(`${balance} wei`)
        console.log(`${balance / 1e18} ETH`)
    })

module.exports = {}
