const { ethers } = require('hardhat');

async function main() {
  // 获取默认账户
  const [deployer] = await ethers.getSigners();

  console.log('部署合约使用账户：', deployer.address);

  // 部署 CrowdFunding 合约
  const CrowdFunding = await ethers.getContractFactory('CrowdFunding');
  const crowdFunding = await CrowdFunding.deploy();

  console.log('CrowdFunding 合约地址：', crowdFunding.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
