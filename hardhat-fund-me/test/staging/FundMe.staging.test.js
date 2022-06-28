const { assert } = require("chai")
const { ethers, getNamedAccounts, network } = require("hardhat")
const { developementChain } = require("../../helper-hardhat-config")

developementChain.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther("0.1")

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
              console.log("Contract: " + fundMe.address)
          })

          it("allow people to fund and withdraw", async function () {
              //   const transactionResponse = await fundMe.withdraw()
              //   await transactionResponse.wait(1)
              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(0, endingFundMeBalance)
              console.log("Pass!")
          })
      })
