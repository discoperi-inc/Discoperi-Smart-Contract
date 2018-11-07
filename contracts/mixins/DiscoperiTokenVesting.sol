pragma solidity 0.4.25;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


/**
 * @title DiscoperiTokenVesting
 * @dev This contract gives possibility for token holders to have vested amounts of tokens on their balances. 
 * Token should check a balance spot for transfer and transferFrom functions to use this feature.
 */
contract DiscoperiTokenVesting {
    using SafeMath for uint256;  

    // vesting parts count
    uint256 public constant VESTING_PARTS = 4;

    // vesting releases timestamps
    uint256[VESTING_PARTS] public vestingReleases;

    // list of vested amounts by beneficiary
    mapping (address => uint256) public vestedAmount;
    
    // vesting event logging
    event Vesting(address indexed to, uint256 amount);    

    /**
     * @dev Find out if the address has vested amounts
     * @param _who address Address checked for vested amounts
     * @return bool Returns true if address has vested amounts     
     */  
    function hasVested(address _who) public view returns (bool) {
        return balanceVested(_who) > 0;
    }

    /**
     * @dev Get balance vested to the current moment of time
     * @param _who address Address owns vested amounts
     * @return uint256 Balance vested to the current moment of time     
     */       
    function balanceVested(address _who) public view returns (uint256) {
        for (uint256 i = 0; i < VESTING_PARTS; i++) {
            if (now < vestingReleases[i]) // solium-disable-line security/no-block-members
               return vestedAmount[_who].mul(VESTING_PARTS - i).div(VESTING_PARTS);
        }
    } 
 
    /**
     * @dev Make vesting for the amount using contract with vesting rules
     * @param _who address Address gets the vested amount
     * @param _amount uint256 Amount to vest
     */ 
    function _vest(address _who, uint256 _amount) internal {
        require(_who != address(0), "Vesting target address can't be zero.");
        require(_amount > 0, "Vesting amount should be > 0.");
        vestedAmount[_who] = vestedAmount[_who].add(_amount);
        emit Vesting(_who, _amount);
    }        
}