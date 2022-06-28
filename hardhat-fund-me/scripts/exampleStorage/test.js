// imports
const { ethers, getNamedAccounts, deployments } = require("hardhat")

// async main
async function main() {
    const { deployer } = await getNamedAccounts()

    console.log("kcheck test start")
    const funWithStorage = await ethers.getContract("FunWithStorage", deployer)
    console.log("address: " + funWithStorage.address)

    console.log("Logging storage...")
    for (let i = 0; i < 10; i++) {
        console.log(
            `Location ${i}: ${await ethers.provider.getStorageAt(
                funWithStorage.address,
                i
            )}`
        )
    }

    // You can use this to trace!
    const trace = await network.provider.send("debug_traceTransaction", [
        funWithStorage.transactionHash,
    ])
    // for (structLog in trace.structLogs) {
    //     if (trace.structLogs[structLog].op == "SSTORE") {
    //         console.log(trace.structLogs[structLog])
    //     }
    // }
    // const firstelementLocation = ethers.utils.keccak256(
    //     "0x0000000000000000000000000000000000000000000000000000000000000002"
    // )
    // const arrayElement = await ethers.provider.getStorageAt(
    //     funWithStorage.address,
    //     firstelementLocation
    // )
    // console.log(`Location ${firstelementLocation}: ${arrayElement}`)

    // Can you write a function that finds the storage slot of the arrays and mappings?
    // And then find the data in those slots?
}

// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
