pragma solidity ^0.5.0;

import "./RewardPoints.sol";

/**
 * Extends RewardPoints contract with helper functions used for testing.
 * For any suggestions please contact me at andrei.dimitrief.jianu(at)gmail.com
 */
contract RewardPoints4Test is RewardPoints
{
    function addMerchant4Test(address merchantAddress, bool merchantIsApproved)
    public
    onlyOwner
    {
        uint256 merchantId = _merchants.length;

        _merchants.push(Merchant(merchantId, merchantAddress, merchantIsApproved));
        _addressToMerchantId[merchantAddress] = merchantId;
    }

    function getMerchantIdWithAddress4Test(address merchantAddress)
    public
    view
    onlyOwner
    returns (uint256 merchantId)
    {
        merchantId = _addressToMerchantId[merchantAddress];
    }

    function addUser4Test(address userAddress, bool userIsApproved, uint256 totalEarnedPoints, uint256 totalReedemedPoints)
    public
    onlyOwner
    {
        uint256 userId = _users.length;

        _users.push(User(userId, userAddress, userIsApproved, totalEarnedPoints, totalReedemedPoints));
        _addressToUserId[userAddress] = userId;
    }

    function getUserIdWithAddress4Test(address userAddress)
    public 
    view
    onlyOwner
    returns (uint256 userId)
    {
        userId = _addressToUserId[userAddress];
    }

    function getOperatorStatus4Test(address merchantAddress, address operatorAddress)
    public 
    view
    onlyOwner
    returns (bool isOperator)
    {
        uint256 merchantId = _addressToMerchantId[merchantAddress];

        isOperator = _merchants[merchantId].isOperator[operatorAddress];
    }

    function getOwnerAddressForOperatorId4Test(uint256 operatorId)
    public 
    view
    onlyOwner
    returns (address ownerAddress)
    {
        ownerAddress = _merchants[operatorId].ownerAddress;
    }

    function getOwnerAddressForOperatorAddress4Test(address operatorAddress)
    public 
    view
    onlyOwner
    returns (address ownerAddress)
    {
        uint256 operatorId = _addressToMerchantId[operatorAddress];

        ownerAddress = _merchants[operatorId].ownerAddress;
    }

    function getUserRewardPoints4Test(address userAddress)
    public 
    view 
    onlyOwner
    returns (uint256 points)
    {
        uint256 userId = _addressToUserId[userAddress];

        points = _users[userId].totalEarnedPoints;
    }

    function getUserRewardPointsFromMerchant4Test(address userAddress, address merchantAddress)
    public 
    view 
    onlyOwner
    returns (uint256 points)
    {
        uint256 userId = _addressToUserId[userAddress];
        uint256 merchantId = _addressToMerchantId[merchantAddress];

        points = _users[userId].earnedPointsFromMerchant[merchantId];
    }

    function addUserRewardPointsForMerchant4Test(address userAddress, address merchantAddress, uint256 rewardPoints)
    public
    onlyOwner
    {
        uint256 userId = _addressToUserId[userAddress];
        uint256 merchantId = _addressToMerchantId[merchantAddress];

        _users[userId].totalEarnedPoints += rewardPoints;
        _users[userId].earnedPointsFromMerchant[merchantId] += rewardPoints;
    }

    function getUserRedeemedPoints4Test(address userAddress)
    public 
    view 
    onlyOwner
    returns (uint256 points)
    {
        uint256 userId = _addressToUserId[userAddress];

        points = _users[userId].totalReedemedPoints;
    }

    function getUserRedeemedPointsFromMerchant4Test(address userAddress, address merchantAddress)
    public 
    view 
    onlyOwner
    returns (uint256 points)
    {
        uint256 userId = _addressToUserId[userAddress];
        uint256 merchantId = _addressToMerchantId[merchantAddress];

        points = _users[userId].redeemedPointsFromMerchant[merchantId];
    }

}
