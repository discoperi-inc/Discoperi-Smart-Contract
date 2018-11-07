pragma solidity 0.4.25;


/**
 * @title IDiscoperiToken
 */
contract IDiscoperiToken {

    /**
     * @dev Burn tokens from sale contract
     */
    function burnSaleTokens() external;

     /**
     * @dev Transfer tokens from one address to another with westing
     * @param _to address which you want to transfer to
     * @param _value the amount of tokens to be transferred
     * @return true if the transfer was succeeded
     */
    function transferWithVesting(address _to, uint256 _value) external returns (bool); 

}