/**
 * Smart contract migration.
 * For any suggestions please contact me at andrei.dimitrief.jianu(at)gmail.com
 */

 var RewardPoints = artifacts.require("./RewardPoints.sol");

module.exports = function(deployer) 
{
    deployer.deploy(RewardPoints);
};
