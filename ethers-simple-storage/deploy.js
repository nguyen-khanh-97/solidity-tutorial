const ethers = require("ethers");
const fs = require("fs-extra");

async function main() {
  // compile them in our code
  // compile them separately
  // http://172.24.144.1:7545
  const provider = new ethers.providers.JsonRpcProvider(
    "http://172.24.144.1:7545"
  );
  const wallet = new ethers.Wallet(
    "00a78b058f7fa45c2601e7d7504ef05d7b5a0d30dcc374bea8a9b49d1257c525",
    provider
  );
  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8");
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8"
  );
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  console.log("Deploying, please wait...");
  const contract = await contractFactory.deploy(); // STOP here! Wait for contract to deploy
  console.log(contract);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
