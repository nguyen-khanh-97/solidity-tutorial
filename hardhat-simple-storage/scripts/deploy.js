// imports

const { ethers, run, network } = require("hardhat")

// async main
async function main() {
    const SimpleStorageFactory = await ethers.getContractFactory(
        "SimpleStorage"
    )
    console.log("Deploying contract...")
    const simpleStorage = await SimpleStorageFactory.deploy()
    await simpleStorage.deployed()
    console.log(`Contract deployed at ${simpleStorage.address}`)
    if (network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY) {
        await simpleStorage.deployTransaction.wait(3)
        await verify(simpleStorage.address, [])
    }

    const currentValue = await simpleStorage.retrieve()
    console.log(`Current value is ${currentValue}`)

    const transactionResponse = await simpleStorage.store(7)
    await transactionResponse.wait(1)
    const updateValue = await simpleStorage.retrieve()
    console.log(`Update value is ${updateValue}`)
}

async function verify(contractAdress, args) {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAdress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!")
        } else {
            console.log(e)
        }
    }
}

// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
