const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")
// 0.25 is the premium. it costs 0.25 LINK per request
const BASE_FEE = ethers.utils.parseEther("0.25")
// Calculated value based on the gas price of the chain
const GAS_PRICE_LINK = 1e9

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [BASE_FEE, GAS_PRICE_LINK]
    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        // now we have to deploy a mocks vrfcordinator...
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })
        log("Mocks deployed")
        log("----------------------------------------------------------")
    }
}
module.exports.tags = ["all", "mocks"]
