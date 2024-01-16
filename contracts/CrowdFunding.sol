// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/utils/Strings.sol";

contract CrowdFunding {
    using Strings for uint256;

    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
    }

    error NonExistentCampaign(string message);
    error TheAmountOfDonationIsIllegal(string message);

    mapping(uint256 => Campaign) public campaigns;

    uint256 public numberOfCampaigns = 0;

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        Campaign storage campaign = campaigns[numberOfCampaigns];

        require(
            _deadline > block.timestamp,
            "Deadline should be a date in the future."
        );

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;

        numberOfCampaigns++;

        return numberOfCampaigns - 1;
    }

    function donateToCampaign(uint256 _id) public payable {
        uint amount = msg.value;

        if (_id >= numberOfCampaigns || _id < 0) {
            revert NonExistentCampaign(
                string.concat(
                    "ID must be less than",
                    numberOfCampaigns.toString()
                )
            );
        }
        if (amount <= 0) {
            revert TheAmountOfDonationIsIllegal(
                "The amount of donation is illegal"
            );
        }

        Campaign storage campaign = campaigns[_id];

        (bool success, bytes memory data) = payable(campaign.owner).call{
            value: msg.value
        }("");
        if (success) {
            campaign.amountCollected = campaign.amountCollected + amount;
            campaign.donators.push(msg.sender);
            campaign.donations.push(amount);
        }
    }

    function getDonators(
        uint256 _id
    ) public view returns (address[] memory, uint256[] memory) {
        if (_id >= numberOfCampaigns || _id < 0) {
            revert NonExistentCampaign(
                string.concat(
                    "ID must be less than",
                    numberOfCampaigns.toString()
                )
            );
        }
        Campaign memory campaign = campaigns[_id];
        return (campaign.donators, campaign.donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);
        for (uint256 i = 0; i < numberOfCampaigns; i++) {
            allCampaigns[i] = campaigns[i];
        }
        return allCampaigns;
    }
}
