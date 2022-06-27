// import
// main function
// call main function

const { network } = require("hardhat")

const { networkConfig, developementChain } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// function deployFunc(hre) {
//     console.log("hello")
//     hre.getNameAccounts()
//     hre.deployments
// }
// module.exports.default = deployFunc

// module.exports = async (hre) => {
//     const { getNameAccounts, deployments } = hre
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
    if (developementChain.includes(network.name) || !networkConfig[chainId]) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeedAddress]
    // when going to localhost or hardhat network, we want to use a mock
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developementChain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        // verify
        await verify(fundMe.address, args)
    }

    log("-----------------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
