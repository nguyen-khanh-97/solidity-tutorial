const { ethers } = require("hardhat")

const networkConfig = {
    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: "0",
        callbackGasLimit: "500000",
        interval: "300",
    },
    31337: {
        entranceFee: ethers.utils.parseEther("1"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "500000",
        interval: "30",
    },
}

const developementChain = ["hardhat", "localhost"]

const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE = 1e9
const DEFAULT_ENTRANCE_FEE = ethers.utils.parseEther("0.01")

module.exports = {
    networkConfig,
    developementChain,
    BASE_FEE,
    GAS_PRICE,
    DEFAULT_ENTRANCE_FEE,
}
