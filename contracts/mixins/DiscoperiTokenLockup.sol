pragma solidity 0.4.25;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title DiscoperiTokenLockup
 * @dev This contract gives possibility for token holders to have locked up (till release time) amounts of tokens on their balances. 
 * Token should check a balance spot for transfer and transferFrom functions to use this feature.
 */
contract DiscoperiTokenLockup {
    using SafeMath for uint256;  

    // LockedUp struct
    struct LockedUp {
        uint256 amount; // lockedup amount
        uint256 release; // release timestamp
    }

    // list of lockedup amounts and release timestamps
    mapping (address => LockedUp[]) public lockedup;

    // lockup event logging
    event Lockup(address indexed to, uint256 amount, uint256 release);

    /**
     * @dev Find out if the address has locked up amounts
     * @param _who address Address checked for lockedup amounts
     * @return bool Returns true if address has lockedup amounts     
     */    
    function hasLockedUp(address _who) public view returns (bool) {
        return balanceLockedUp(_who) > 0;
    }    

    /**
     * @dev Get balance locked up to the current moment of time
     * @param _who address address owns lockedup amounts
     * @return uint256 balance locked up to the current moment of time     
     */       
    function balanceLockedUp(address _who) public view returns (uint256) {
        uint256 _balanceLockedUp = 0;
        for (uint256 i = 0; i < lockedup[_who].length; i++) {
            if (lockedup[_who][i].release > block.timestamp) // solium-disable-line security/no-block-members
                _balanceLockedUp = _balanceLockedUp.add(lockedup[_who][i].amount);
        }
        return _balanceLockedUp;
    }    
    
    /**
     * @dev Lockup amount till release time
     * @param _who address who gets the lockedup amount
     * @param _amount amount to lockup
     * @param _release release timestamp     
     */     
    function _lockup(address _who, uint256 _amount, uint256 _release) internal {
        if (_release != 0) {
            require(_who != address(0), "Lockup target address can't be zero.");
            require(_amount > 0, "Lockup amount should be > 0.");   
            require(_release > block.timestamp, "Lockup release time should be > now."); // solium-disable-line security/no-block-members 
            lockedup[_who].push(LockedUp(_amount, _release));
            emit Lockup(_who, _amount, _release);
        }
    }      

}