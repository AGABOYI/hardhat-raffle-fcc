const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { assert, expect } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Staging Tests", async function () {
          // First we will need to deploy the Raffle , and vrfCoordinatorV2Mock
          let raffle, raffleEntranceFee, deployer
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
          })
          describe("fulfillRandomWords", function () {
              it("works with live chainlink Keepers and chainling VRF, we get a random winner", async function () {
                  console.log("Setting up test...")
                  const startingTimeStamp = await raffle.getLastestTimeStamp()
                  const accounts = await ethers.getSigners()
                  console.log("Setting up Listener...")
                  await new Promise(async (resolve, reject) => {
                      // setup the listener before we enter the raffle
                      // In case the blockchain move really fast
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired")
                          try {
                              // add our assert here
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance = await accounts[0].getBalance() // since accounts[0] is our deployer
                              const endingTimeStamp = await raffle.getLastestTimeStamp()

                              await expect(raffle.getPlayers(0)).to.be.reverted
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(raffleState, 0)
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(raffleEntranceFee).toString()
                              )

                              assert(endingTimeStamp > startingTimeStamp)
                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(error)
                          }
                      })
                      // we will now enter the raffle
                      console.log("Entering Raffle...")
                      const tx = await raffle.enterRaffle({ value: raffleEntranceFee })
                      await tx.wait(1)
                      console.log("Ok, time to wait...")
                      const winnerStartingBalance = await accounts[0].getBalance()
                  })
              })
          })
      })
