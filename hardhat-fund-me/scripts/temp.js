// imports
const { networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// async main
async function main() {
    let ethUsdPriceFeedAddress =
        networkConfig[network.config.chainId]["ethUsdPriceFeed"]

    console.log("ethUsdPriceFeedAddress: " + ethUsdPriceFeedAddress)
    await verify("0x8b2cbeeb23edbedcd5c53be7410865bdcb3a2549", [
        ethUsdPriceFeedAddress,
    ])
}

// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
