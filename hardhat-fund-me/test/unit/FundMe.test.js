const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developementChain } = require("../../helper-hardhat-config")

!developementChain.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1") //1ETH
          beforeEach(async function () {
              // deploy FundMe contract using Hardhat-deploy
              // const accounts = await ethers.getSigners()
              // const accountZero = accounts[0]
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              it("sets the aggregator address correctly", async function () {
                  const response = await fundMe.s_priceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async function () {
              it("Fail if you do not set enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })

              it("update the amount funded data", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.s_addressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("add funder to array of s_funders", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.s_funders(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw ETH from a single funder", async function () {
                  // Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasPrice = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert
                  assert.equal(0, endingFundMeBalance)
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerBalance.add(gasPrice).toString()
                  )
              })

              it("withdraw ETH from a multi funder", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 0; i < 6; i++) {
                      const fundmeConnectToAccount = await fundMe.connect(
                          accounts[i]
                      )
                      await fundmeConnectToAccount.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasPrice = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert
                  assert.equal(0, endingFundMeBalance)
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerBalance.add(gasPrice).toString()
                  )

                  // make sure that the s_funders array is reset
                  await expect(fundMe.s_funders(0)).to.be.reverted

                  for (let i = 0; i < 6; i++) {
                      assert(fundMe.s_addressToAmountFunded(accounts[i]), 0)
                  }
              })

              it("withdraw ETH from a attacker", async function () {
                  // Arrange
                  const fundmeConnectToAttacker = fundMe.connect(
                      (await ethers.getSigners())[2]
                  )

                  // Act

                  // Assert
                  await expect(
                      fundmeConnectToAttacker.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })
          })

          describe("cheaperwithdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw ETH from a single funder", async function () {
                  // Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasPrice = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert
                  assert.equal(0, endingFundMeBalance)
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerBalance.add(gasPrice).toString()
                  )
              })

              it("withdraw ETH from a multi funder", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 0; i < 6; i++) {
                      const fundmeConnectToAccount = await fundMe.connect(
                          accounts[i]
                      )
                      await fundmeConnectToAccount.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasPrice = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert
                  assert.equal(0, endingFundMeBalance)
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerBalance.add(gasPrice).toString()
                  )

                  // make sure that the s_funders array is reset
                  await expect(fundMe.s_funders(0)).to.be.reverted

                  for (let i = 0; i < 6; i++) {
                      assert(fundMe.s_addressToAmountFunded(accounts[i]), 0)
                  }
              })

              it("withdraw ETH from a attacker", async function () {
                  // Arrange
                  const fundmeConnectToAttacker = fundMe.connect(
                      (await ethers.getSigners())[2]
                  )

                  // Act

                  // Assert
                  await expect(
                      fundmeConnectToAttacker.cheaperWithdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })
          })

          describe("version", async function () {
              it("get version of the aggregator", async function () {
                  const expectValue = await mockV3Aggregator.version()
                  const actualValue = await fundMe.getVersion()
                  assert.equal(expectValue.toString(), actualValue.toString())
              })
          })
      })
