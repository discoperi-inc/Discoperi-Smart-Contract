const DiscoperiToken = artifacts.require("DiscoperiToken.sol");

module.exports = async function(accounts, env) {

    env.token = await DiscoperiToken.new();
    env.sale = {
        address: accounts[6]
    }
   
};
