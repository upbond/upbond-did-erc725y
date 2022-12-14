// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const UpbondDID = await hre.ethers.getContractFactory("UpbondDID");
  const upbondDID = await UpbondDID.deploy();
  await upbondDID.deployed();
  console.log(`Upbond DID implementation deployed at : ${upbondDID.address}`);

  const UpbondDIDFactory = await hre.ethers.getContractFactory("UpbondDIDFactory");
  const upbondDIDFactory = await UpbondDIDFactory.deploy(upbondDID.address);
  await upbondDIDFactory.deployed();
  console.log(`Upbond DID factory deployed at : ${upbondDIDFactory.address}`);

  if(hre.network.config.chainId !== undefined){
    console.log("Waiting block confirm...");
    setTimeout(async () => {
      console.log("Verifying Contract DID");
      await hre.run("verify:verify", {
        address: upbondDID.address,
        constructorArguments: [],
      });

      console.log("Verifying Contract DID Factory");
      await hre.run("verify:verify", {
        address: upbondDIDFactory.address,
        constructorArguments: [upbondDID.address],
      });
    }, 80000);
  }else{
    console.log("Skip because local deploy")
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
