const DiscoperiToken = artifacts.require("DiscoperiToken.sol");

module.exports = function(deployer, network) {

    if (network == "coverage" || network == "development")
        deployer.deploy(
            DiscoperiToken
        );
    else
        deployer.deploy(
            DiscoperiToken,
            { gas: 4000000 }
        );
};