const { developementChain, networkConfig } = require("../../helper-hardhat-config")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { assert, expect } = require("chai")

!developementChain.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Test", async function () {
          let raffle, vrfCoordinatorV2Mock, deployer, entraceFee, interval

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              chainId = network.config.chainId

              raffle = await ethers.getContract("Raffle", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              entraceFee = await raffle.getEntraceFee()
              interval = await raffle.getInterval()
          })

          describe("constructor", async function () {
              it("Initialize the raffle contract correctly", async function () {
                  // ideally, we make our unit test have only 1 assert per it
                  const raffleState = await raffle.getRaffleState()

                  assert.equal(raffleState.toString(), "0")
                  assert.equal(
                      entraceFee.toString(),
                      networkConfig[chainId]["entranceFee"].toString()
                  )
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
              })
          })

          describe("enterRaffer", async function () {
              it("Revert when you donot pay enough", async function () {
                  await expect(raffle.enterRaffle()).to.be.revertedWith("Raffle__NotEnoughETH")
              })

              it("record player when they enter", async function () {
                  await raffle.enterRaffle({ value: entraceFee })
                  const playerFromContract = await raffle.getPlayers(0)
                  assert(playerFromContract, deployer)
              })

              it("emit event on enter", async function () {
                  await expect(raffle.enterRaffle({ value: entraceFee })).to.emit(
                      raffle,
                      "RaffleEnter"
                  )
              })

              it("doesnot allow when raffle is caculating", async function () {
                  await raffle.enterRaffle({ value: entraceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])

                  // we pretent to to be the chainlink keeper
                  await raffle.performUpkeep([])

                  await expect(raffle.enterRaffle({ value: entraceFee })).to.be.revertedWith(
                      "Raffle__NotOpen"
                  )
              })
          })

          describe("checkUpkeep", async function () {
              it("returns false if people havenot send any ETH", async function () {})
          })
      })
