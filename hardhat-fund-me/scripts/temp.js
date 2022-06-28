// imports
const { ethers, getNamedAccounts, deployments } = require("hardhat")
const { networkConfig, developementChain } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// async main
async function main() {
    let ethUsdPriceFeedAddress
    if (developementChain.includes(network.name) || !networkConfig[chainId]) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const { deployer } = await getNamedAccounts()
    const signer = ethers.provider.getSigner()

    fundMe = await ethers.getContract("FundMe", deployer)
    // const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    // const contract = new ethers.Contract(
    //     ethUsdAggregator.address,
    //     ethUsdAggregator.abi,
    //     signer
    // )
    // const value = await contract.latestRoundData()
    // await fundMe.fund({ value: ethers.utils.parseEther("1") })
    const value = await fundMe.provider.getBalance(fundMe.address)
    console.log("check: " + value)
}

// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
