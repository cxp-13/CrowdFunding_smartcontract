const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('CrowdFunding', function () {
    let crowdFunding;

    before(async function () {
        const CrowdFunding = await ethers.getContractFactory('CrowdFunding');
        crowdFunding = await CrowdFunding.deploy();
        await crowdFunding.waitForDeployment();
    });

    it('should create a campaign', async function () {
        const owner = await ethers.provider.getSigner(0);
        console.log("owner", owner);
        const title = 'Test Campaign';
        const description = 'Description for testing';
        const target = ethers.parseEther('10'); // 10 ETH
        const deadline = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
        const image = 'test-image-url';

        const createTx = await crowdFunding.createCampaign(
            owner.address,
            title,
            description,
            target,
            deadline,
            image
        );

        // Wait for the transaction to be mined
        await createTx.wait();

        // Get the created campaign
        const campaign = await crowdFunding.campaigns(0);
        const numberOfCampaigns = await crowdFunding.numberOfCampaigns()


        expect(campaign.owner).to.equal(owner.address);
        expect(campaign.title).to.equal(title);
        expect(numberOfCampaigns).to.equal(1);
    });


    it('should revert a invaid deadline error', async function () {
        const owner = await ethers.provider.getSigner(0);
        const title = 'Test Campaign';
        const description = 'Description for testing';
        const target = ethers.parseEther('10'); // 10 ETH
        const deadline = Math.floor(Date.now() / 1000) - 86400; // 1 day ago
        const image = 'test-image-url';

        const createCampaign = crowdFunding.createCampaign(
            owner.address,
            title,
            description,
            target,
            deadline,
            image
        )

        await expect(createCampaign).to.be.revertedWith("Deadline should be a date in the future.");

    });

    it('should donate to a campaign', async function () {
        // Get the second account's signer
        const secondAccount = await ethers.provider.getSigner(1);

        console.log("secondAccount", secondAccount);

        // Donate to the campaign using the second account
        const donationAmount = ethers.parseEther('0.0001');
        const donateTx = await crowdFunding.connect(secondAccount).donateToCampaign(0, {
            value: donationAmount,
        });

        // Wait for the transaction to be mined
        await donateTx.wait();

        // Get the updated campaign
        const updatedCampaign = await crowdFunding.campaigns(0);
        const donateInfo = await crowdFunding.getDonators(0)

        console.log("updatedCampaign", updatedCampaign);
        console.log("donateInfo", donateInfo);
        // Add assertions based on your contract's logic
        expect(updatedCampaign.amountCollected).to.equal(donationAmount);
        // first donator
        expect(donateInfo[0][0]).to.equal(secondAccount);
        //  amount of first donator's donation
        expect(donateInfo[1][0]).to.equal(donationAmount);
    });

});
