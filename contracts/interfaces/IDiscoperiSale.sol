pragma solidity 0.4.25;


/**
 * @title IDiscoperiSale
 */
contract IDiscoperiSale {
    
    /**
     * @dev Order tokens for beneficiary
     * @param _collector  collector id
     * @param _tx hash of the transaction
     * @param _beneficiary beneficiary who has paid coins for tokens
     * @param _funds amount of coins beneficiary has paid 
     */
    function acquireTokens(uint256 _collector, uint256 _tx, address _beneficiary, uint256 _funds) external payable;

}
