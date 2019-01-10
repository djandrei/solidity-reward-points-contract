pragma solidity ^0.5.0;

/**
 * Based on Blockgeeks course template (cohort November 2018).
 * For any suggestions please contact me at andrei.dimitrief.jianu(at)gmail.com.
 */

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract RewardPoints is Ownable, Pausable
{
    using SafeMath for uint256;
    
    mapping(address => bool) internal _addressBelongsToAdmin;

    struct Merchant 
    {
        uint256 merchantId;
        address ownerAddress;
        bool merchantIsApproved;
        mapping(address => bool) isOperator;
    }
    Merchant[] internal _merchants;
    // this one maps both merchant/operator address => merchant ID
    mapping(address => uint256) internal _addressToMerchantId;

    struct User 
    {
        uint256 userId;
        address userAddress;
        bool userIsApproved;
        uint256 totalEarnedPoints;
        uint256 totalReedemedPoints;
        mapping(uint256 => uint256) earnedPointsFromMerchant;
        mapping(uint256 => uint256) redeemedPointsFromMerchant;
    }
    User[] internal _users;
    mapping(address => uint256) internal _addressToUserId;

    // =================================
    // Events
    // =================================

    event AddedAdmin(address indexed adminAddress);
    event RemovedAdmin(address indexed adminAddress);

    event AddedMerchant(address indexed merchantAddress, uint256 indexed merchantId);
    event BannedMerchant(uint256 indexed merchantId);
    event ApprovedMerchant(uint256 indexed merchantId);
    event TransferredMerchantOwnership(uint256 indexed merchantId, address oldOwnerAddress, address newOwnerAddress);

    event AddedOperator(uint256 indexed merchantId, address indexed operatorAddress);
    event RemovedOperator(uint256 indexed merchantId, address indexed operatorAddress);

    event AddedUser(address indexed userAddress, uint256 indexed userId);
    event BannedUser(address indexed userAddress, uint256 indexed userId);
    event ApprovedUser(address indexed userAddress, uint256 indexed userId);

    event RewardedUser(address indexed userAddress, uint256 indexed merchantId, uint256 points);
    event RedeemedPoints(address indexed userAddress, uint256 indexed merchantId, uint256 points);

    // =================================
    // Private functions
    // =================================

    function _merchantExists(uint256 merchantId) 
    internal 
    view 
    returns(bool merchantExists) 
    {
        merchantExists = false;
        if (0 < merchantId && merchantId < _merchants.length)
        {
            merchantExists = true;
        }
    }

    function _merchantIsValid(uint256 merchantId) 
    internal 
    view 
    returns(bool merchantIsValid) 
    {
        merchantIsValid = false;
        if(_merchantExists(merchantId) && _merchants[merchantId].merchantIsApproved)
        {
            merchantIsValid = true;
        }
    }

    function _isMerchantOwner(address ownerAddress) 
    internal 
    view 
    returns(bool) 
    {
        uint256 merchantId = _addressToMerchantId[ownerAddress];

        return (_merchantIsValid(merchantId) && _merchants[merchantId].ownerAddress == ownerAddress);
    }

    function _userExists(uint256 userId) 
    internal 
    view 
    returns(bool userExists) 
    {
        userExists = false;
        if(0 < userId && userId < _users.length)
        {
            userExists = true;
        }
    }

    function _userIsValid(uint256 userId) 
    internal 
    view 
    returns(bool userIsValid) 
    {
        userIsValid = false;
        if(_userExists(userId) && _users[userId].userIsApproved)
        {
            userIsValid = true;
        }
    }

    // =================================
    // Modifiers
    // =================================

    modifier onlyAdmin() 
    {
        require(_addressBelongsToAdmin[msg.sender] || msg.sender == owner(), "only admin allowed");
        _;
    }

    modifier onlyMerchantOwner() 
    {
        require(_isMerchantOwner(msg.sender), "only merchant owner allowed");
        _;
    }

    modifier onlyMerchant() 
    {
        uint256 merchantId = _addressToMerchantId[msg.sender];
        bool isOperator = _merchants[merchantId].isOperator[msg.sender];
        require(_merchantIsValid(merchantId), "invalid merchant");
        require(_isMerchantOwner(msg.sender) || isOperator, "invalid merchant/operator");
        _;
    }

    modifier onlyUser() 
    {
        uint256 userId = _addressToUserId[msg.sender];
        require(_userIsValid(userId), "invalid user");
        _;
    }

    // =================================
    // Public functions
    // =================================
    
    constructor() 
    public 
    {
        // dummy merchant and user records at index 0;
        _merchants.push(Merchant(0, address(0), false));
        _users.push(User(0, address(0), false, 0, 0));
        
    }

    // =================================
    // Owner only actions
    // =================================

    function addAdmin(address adminAddress) 
    external 
    onlyOwner 
    {
        require(address(0) != adminAddress, "invalid admin address");
        require(!_addressBelongsToAdmin[adminAddress], "admin already registered");

        _addressBelongsToAdmin[adminAddress] = true;

        emit AddedAdmin(adminAddress);
    }

    function removeAdmin(address adminAddress) 
    external 
    onlyOwner 
    {
        require(address(0) != adminAddress, "invalid admin address");
        require(_addressBelongsToAdmin[adminAddress], "admin not registered");

        _addressBelongsToAdmin[adminAddress] = false;

        emit RemovedAdmin(adminAddress);
    }

    // =================================
    // Admin only actions
    // =================================

    function addMerchant(address merchantAddress) 
    external 
    onlyAdmin 
    {
        require(address(0) != merchantAddress, "invalid merchant address");
        require(0 == _addressToMerchantId[merchantAddress], "merchant already registered");

        uint256 merchantId = _merchants.length;

        _merchants.push(Merchant(merchantId, merchantAddress, true));
        _addressToMerchantId[merchantAddress] = merchantId;

        emit AddedMerchant(merchantAddress, merchantId);
    }

    function banMerchant(uint256 merchantId) 
    external 
    onlyAdmin 
    {
        require(_merchantIsValid(merchantId), "invalid merchant");

        _merchants[merchantId].merchantIsApproved = false;

        emit BannedMerchant(merchantId);
    }

    function approveMerchant(uint256 merchantId) 
    external
    onlyAdmin 
    {
        require(_merchantExists(merchantId), "merchant is not registered");
        require(!_merchants[merchantId].merchantIsApproved, "merchant already approved");

        _merchants[merchantId].merchantIsApproved = true;

        emit ApprovedMerchant(merchantId);
    }

    function addUser(address userAddress) 
    external 
    onlyAdmin 
    {
        require(address(0) != userAddress, "invalid user address");
        require(0 == _addressToUserId[userAddress], "user already registered");

        uint256 userId = _users.length;

        _users.push(User(userId, userAddress, true, 0, 0));
        _addressToUserId[userAddress] = userId;

        emit AddedUser(userAddress, userId);
    }

    function banUser(address userAddress) 
    external 
    onlyAdmin 
    {
        require(address(0) != userAddress, "invalid user address");

        uint256 userId = _addressToUserId[userAddress];

        require(_userIsValid(userId), "invalid user");

        _users[userId].userIsApproved = false;

        emit BannedUser(userAddress, userId);
    }

    function approveUser(address userAddress) 
    external 
    onlyAdmin 
    {
        require(address(0) != userAddress, "invalid user address");

        uint256 userId = _addressToUserId[userAddress];

        require(_userExists(userId), "user is not registered");
        require(!_users[userId].userIsApproved, "user is already approved");

        _users[userId].userIsApproved = true;

        emit ApprovedUser(userAddress, userId);
    }

    // =================================
    // Merchant owner only actions
    // =================================

    function addOperator(address operatorAddress) 
    external 
    onlyMerchantOwner 
    whenNotPaused
    {
        require(address(0) != operatorAddress, "invalid operator address");
        require(0 == _addressToMerchantId[operatorAddress], "operator already registered");

        address merchantAddress = msg.sender;
        uint256 merchantId = _addressToMerchantId[merchantAddress];

        _merchants[merchantId].isOperator[operatorAddress] = true;
        _addressToMerchantId[operatorAddress] = merchantId;

        emit AddedOperator(merchantId, operatorAddress);
    }

    function removeOperator(address operatorAddress) 
    external 
    onlyMerchantOwner 
    whenNotPaused
    {
        require(address(0) != operatorAddress, "invalid operator address");
        require(0 != _addressToMerchantId[operatorAddress], "operator not registered");

        uint256 merchantId = _addressToMerchantId[msg.sender];

        require(_merchants[merchantId].isOperator[operatorAddress], "operator not registered");

        _merchants[merchantId].isOperator[operatorAddress] = false;
        _addressToMerchantId[operatorAddress] = 0;

        emit RemovedOperator(merchantId, operatorAddress);
    }

    function transferMerchantOwnership(address newMerchantAddress) 
    external 
    onlyMerchantOwner 
    whenNotPaused
    {
        require(address(0) != newMerchantAddress, "invalid merchant address");
        require(0 == _addressToMerchantId[newMerchantAddress], "merchant already registered");

        address merchantAddress = msg.sender;
        uint256 merchantId = _addressToMerchantId[merchantAddress];

        _merchants[merchantId].ownerAddress = newMerchantAddress;

        _addressToMerchantId[merchantAddress] = 0;
        _addressToMerchantId[newMerchantAddress] = merchantId;

        emit TransferredMerchantOwnership(merchantId, merchantAddress, newMerchantAddress);
    }

    // =================================
    // Merchant only actions
    // =================================

    function rewardUser(address userAddress, uint256 points) 
    external 
    onlyMerchant 
    whenNotPaused
    {
        require(address(0) != userAddress, "invalid user address");
        require(msg.sender != userAddress, "merchant/operator cannot reward herself");
        require(0 != points, "number of points cannot be zero");

        uint256 userId = _addressToUserId[userAddress];

        require(_userIsValid(userId), "invalid user");

        uint256 merchantId = _addressToMerchantId[msg.sender];

        _users[userId].totalEarnedPoints = _users[userId].totalEarnedPoints.add(points);
        _users[userId].earnedPointsFromMerchant[merchantId] = _users[userId].earnedPointsFromMerchant[merchantId].add(points);

        emit RewardedUser(userAddress, merchantId, points);
    }

    // =================================
    // User only action
    // =================================

    function redeemPoints(uint256 merchantId, uint256 points) 
    external 
    onlyUser 
    whenNotPaused
    {
        address userAddress = msg.sender;
        uint256 userId = _addressToUserId[userAddress];
        
        require(_merchantIsValid(merchantId), "invalid merchant");
        require(0 != points, "number of points cannot be zero");

        require(points <= _users[userId].earnedPointsFromMerchant[merchantId], "points not available");

        _users[userId].totalReedemedPoints = _users[userId].totalReedemedPoints.add(points);
        _users[userId].redeemedPointsFromMerchant[merchantId] = _users[userId].redeemedPointsFromMerchant[merchantId].add(points);

        _users[userId].totalEarnedPoints = _users[userId].totalEarnedPoints.sub(points);
        _users[userId].earnedPointsFromMerchant[merchantId] = _users[userId].earnedPointsFromMerchant[merchantId].sub(points);

        emit RedeemedPoints(userAddress, merchantId, points);
    }

    // =================================
    // Getters
    // =================================

    function isAdmin(address adminAddress)
    public
    view
    returns(bool)
    {
        return _addressBelongsToAdmin[adminAddress];
    }

    function getMerchantById(uint256 merchantId) 
    public
    view 
    returns(uint256, address, bool) 
    {
        require(_merchantExists(merchantId), "merchant is not registered");

        Merchant storage merchant = _merchants[merchantId];
        
        return (
            merchant.merchantId, 
            merchant.ownerAddress, 
            merchant.merchantIsApproved);
    }

    function getMerchantByAddress(address merchantAddress) 
    public 
    view 
    returns(uint256, address, bool) 
    {
        uint256 merchantId = _addressToMerchantId[merchantAddress];

        return getMerchantById(merchantId);
    }

    function isMerchantOperator(address operatorAddress, uint256 merchantId) 
    public 
    view 
    returns(bool) 
    {
        require(address(0) != operatorAddress, "invalid operator address");
        require(_merchantExists(merchantId), "merchant is not registered");
        
        return _merchants[merchantId].isOperator[operatorAddress];
    }

    function getUserById(uint256 userId) 
    public 
    view 
    returns(uint256, address, bool, uint256, uint256) 
    {
        require(_userExists(userId), "user is not registered");

        User storage user = _users[userId];
        
        return (
            user.userId, 
            user.userAddress, 
            user.userIsApproved, 
            user.totalEarnedPoints, 
            user.totalReedemedPoints);
    }

    function getUserByAddress(address userAddress) 
    public 
    view 
    returns(uint256, address, bool, uint256, uint256) 
    {
        require(address(0) != userAddress, "invalid user address");

        uint256 userId = _addressToUserId[userAddress];
        
        return getUserById(userId);
    }

    function getUserEarnedPointsAtMerchant(address userAddress, uint256 merchantId) 
    public 
    view 
    returns(uint256 points) 
    {
        require(address(0) != userAddress, "invalid user address");
        
        uint256 userId = _addressToUserId[userAddress];
        
        require(_userExists(userId), "user is not registered");
        require(_merchantExists(merchantId), "merchant is not registered");

        points = _users[userId].earnedPointsFromMerchant[merchantId];
    }

    function getUserRedeemedPointsAtMerchant(address userAddress, uint256 merchantId) 
    public 
    view 
    returns(uint256 points) 
    {
        require(address(0) != userAddress, "invalid user address");
        
        uint256 userId = _addressToUserId[userAddress];
        
        require(_userExists(userId), "user is not registered");
        require(_merchantExists(merchantId), "merchant is not registered");

        points = _users[userId].redeemedPointsFromMerchant[merchantId];
    }

}
