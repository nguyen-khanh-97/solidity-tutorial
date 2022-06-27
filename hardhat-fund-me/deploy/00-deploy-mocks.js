const { network } = require("hardhat")
const {
    networkConfig,
    developementChain,
    DECIMAL,
    INITIAL_ANWSER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developementChain.includes(network.name) || !networkConfig[chainId]) {
        log(`Chain ${network.name} is not config, deploying mocks...`)
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMAL, INITIAL_ANWSER],
        })
        log("Mocks deployed!")
        log("-----------------------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
