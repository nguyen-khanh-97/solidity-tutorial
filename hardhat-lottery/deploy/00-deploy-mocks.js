const { network } = require("hardhat")
const { developementChain, BASE_FEE, GAS_PRICE } = require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { log, deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [BASE_FEE, GAS_PRICE]

    if (developementChain.includes(network.name) || !networkConfig[chainId]) {
        log(`Chain ${network.name} is not config, deploying mocks...`)
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
            waitConfirmations: network.config.blockConfirmations || 1,
        })
        log("Mocks deployed!")
        log("-----------------------------------------------------------------")
    }
}
