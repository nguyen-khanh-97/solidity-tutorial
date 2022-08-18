const { network, ethers } = require("hardhat")

async function main() {
    console.log(network.name)

    const { deployer } = await getNamedAccounts()

    const c = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
    console.log("check c: " + c.address)
    const r = await ethers.getContract("Raffle", deployer)
    console.log("check r: " + r.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
