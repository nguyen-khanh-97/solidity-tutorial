// imports

const { ethers, run, network } = require("hardhat")

// async main
async function main() {
    const blockNumber = await ethers.provider.getNetwork()
    console.log(blockNumber)
}

// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
