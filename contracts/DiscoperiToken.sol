pragma solidity 0.4.25;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/TokenTimelock.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./mixins/DiscoperiTokenVesting.sol";
import "./mixins/DiscoperiTokenLockup.sol";
import "./interfaces/IDiscoperiToken.sol";


/**
 * @title DiscoperiToken
 * @dev Discoperi Token contract
 */
contract DiscoperiToken is  
    IDiscoperiToken,
    StandardToken, 
    Ownable,
    DiscoperiTokenLockup,
    DiscoperiTokenVesting
{
    using SafeMath for uint256;

    // token constants
    string public constant name = "Discoperi Token"; // solium-disable-line uppercase
    string public constant symbol = "DISC"; // solium-disable-line uppercase
    uint8 public constant decimals = 18; // solium-disable-line uppercase

    // total tokens supply
    uint256 public constant TOTAL_SUPPLY = 200000000000 * (10 ** uint256(decimals)); // 200,000,000,000 DISCs

    // TOTAL_SUPPLY is distributed as follows
    uint256 public constant SALES_SUPPLY = 50000000000 * (10 ** uint256(decimals)); // 50,000,000,000 DISCs - 25%
    uint256 public constant INVESTORS_SUPPLY = 50000000000 * (10 ** uint256(decimals)); // 50,000,000,000 DISCs - 25%
    uint256 public constant TEAM_SUPPLY = 30000000000 * (10 ** uint256(decimals)); // 30,000,000,000 DISCs - 15%
    uint256 public constant RESERVE_SUPPLY = 22000000000 * (10 ** uint256(decimals)); // 22,000,000,000 DISCs - 11%
    uint256 public constant MARKET_DEV_SUPPLY = 20000000000 * (10 ** uint256(decimals)); // 20,000,000,000 DISCs - 10%    
    uint256 public constant PR_ADVERSTISING_SUPPLY = 15000000000 * (10 ** uint256(decimals)); // 15,000,000,000 DISCs - 7.5%
    uint256 public constant REFERRAL_SUPPLY = 8000000000 * (10 ** uint256(decimals)); // 8,000,000,000 DISCs - 4%
    uint256 public constant ANGEL_INVESTORS_SUPPLY = 5000000000 * (10 ** uint256(decimals)); // 5,000,000,000 DISCs - 2.5%
    
    // fund wallets
    address public constant MARKET_DEV_ADDRESS = 0x3f272f26C2322cB38781D0C6C42B1c2531Ec79Be;
    address public constant TEAM_ADDRESS = 0xD8069C8c24D10023DBC5823156994aC2A638dBBd;
    address public constant RESERVE_ADDRESS = 0x7656Cee371A812775A5E0Fb98a565Cc731aCC44B;
    address public constant INVESTORS_ADDRESS= 0x25230591492198b6DD4363d03a7dAa5aD7590D2d;
    address public constant PR_ADVERSTISING_ADDRESS = 0xC36d70AE6ddBE87F973bf4248Df52d0370FBb7E7;

    // sale address
    address public sale;

    // restrict execution only for sale address
    modifier onlySale() {
        require(msg.sender == sale, "Attemp to execute by not sale address");
        _;
    }

    // restrict execution only for authorized address
    modifier onlyLockupAuthorized() {
        require(msg.sender == INVESTORS_ADDRESS || msg.sender == sale, "Attemp to lockup tokens by not authorized address");
        _;
    }

    // check balance spot on transfer
    modifier spotTransfer(address _from, uint256 _value) {
        require(_value <= balanceSpot(_from), "Attempt to transfer more than balance spot");
        _;
    }

    // burn event
    event Burn(address indexed burner, uint256 value);

    /**
     * CONSTRUCTOR
     * @dev Allocate investors tokens supply
     */
    constructor() public { 
        balances[INVESTORS_ADDRESS] = balances[INVESTORS_ADDRESS].add(INVESTORS_SUPPLY);
        totalSupply_ = totalSupply_.add(INVESTORS_SUPPLY);
        emit Transfer(address(0), INVESTORS_ADDRESS, INVESTORS_SUPPLY);

        balances[INVESTORS_ADDRESS] = balances[INVESTORS_ADDRESS].add(ANGEL_INVESTORS_SUPPLY);
        totalSupply_ = totalSupply_.add(ANGEL_INVESTORS_SUPPLY);
        emit Transfer(address(0), INVESTORS_ADDRESS, ANGEL_INVESTORS_SUPPLY);
    }

    /**
     * @dev Initialize token contract and allocate tokens supply
     * @param _sale address of the sale contract
     * @param _teamRelease team tokens release timestamp
     * @param _vestingFirstRelease first release timestamp of tokens vesting
     * @param _vestingSecondRelease second release timestamp of tokens vesting
     * @param _vestingThirdRelease third release timestamp of tokens vesting
     * @param _vestingFourthRelease fourth release timestamp of tokens vesting
     */
    function init(
        address _sale, 
        uint256 _teamRelease, 
        uint256 _vestingFirstRelease,
        uint256 _vestingSecondRelease,
        uint256 _vestingThirdRelease,
        uint256 _vestingFourthRelease
    ) 
        external 
        onlyOwner 
    {
        require(sale == address(0), "cannot execute init function twice");
        require(_sale != address(0), "cannot set zero address as sale");
        require(_teamRelease > now, "team tokens release date should be > now"); // solium-disable-line security/no-block-members
        require(_vestingFirstRelease > now, "vesting first release date should be > now"); // solium-disable-line security/no-block-members
        require(_vestingSecondRelease > now, "vesting second release date should be > now"); // solium-disable-line security/no-block-members
        require(_vestingThirdRelease > now, "vesting third release date should be > now"); // solium-disable-line security/no-block-members
        require(_vestingFourthRelease > now, "vesting fourth release date should be > now"); // solium-disable-line security/no-block-members

        sale = _sale;

        balances[sale] = balances[sale].add(SALES_SUPPLY);
        totalSupply_ = totalSupply_.add(SALES_SUPPLY);
        emit Transfer(address(0), sale, SALES_SUPPLY);

        balances[sale] = balances[sale].add(REFERRAL_SUPPLY);
        totalSupply_ = totalSupply_.add(REFERRAL_SUPPLY);
        emit Transfer(address(0), sale, REFERRAL_SUPPLY);

        TokenTimelock teamTimelock = new TokenTimelock(this, TEAM_ADDRESS, _teamRelease);
        balances[teamTimelock] = balances[teamTimelock].add(TEAM_SUPPLY);
        totalSupply_ = totalSupply_.add(TEAM_SUPPLY);
        emit Transfer(address(0), teamTimelock, TEAM_SUPPLY);
         
        balances[MARKET_DEV_ADDRESS] = balances[MARKET_DEV_ADDRESS].add(MARKET_DEV_SUPPLY);
        totalSupply_ = totalSupply_.add(MARKET_DEV_SUPPLY);
        emit Transfer(address(0), MARKET_DEV_ADDRESS, MARKET_DEV_SUPPLY);

        balances[RESERVE_ADDRESS] = balances[RESERVE_ADDRESS].add(RESERVE_SUPPLY);
        totalSupply_ = totalSupply_.add(RESERVE_SUPPLY);
        emit Transfer(address(0), RESERVE_ADDRESS, RESERVE_SUPPLY);
       
        balances[PR_ADVERSTISING_ADDRESS] = balances[PR_ADVERSTISING_ADDRESS].add(PR_ADVERSTISING_SUPPLY);
        totalSupply_ = totalSupply_.add(PR_ADVERSTISING_SUPPLY);
        emit Transfer(address(0), PR_ADVERSTISING_ADDRESS, PR_ADVERSTISING_SUPPLY);

        vestingReleases[0] = _vestingFirstRelease;
        vestingReleases[1] = _vestingSecondRelease;
        vestingReleases[2] = _vestingThirdRelease;
        vestingReleases[3] = _vestingFourthRelease;
    }

    /**
     * @dev Transfer tokens from one address to another with vesting
     * @param _to address which you want to transfer to
     * @param _value the amount of tokens to be transferred
     * @return true if the transfer was succeeded
     */
    function transferWithVesting(address _to, uint256 _value) external onlySale returns (bool) {    
        _vest(_to, _value);
        return super.transfer(_to, _value);
    }

    /**
     * @dev Transfer  tokens from one address to another with locking up
     * @param _to address which you want to transfer to
     * @param _value the amount of tokens to be transferred
     * @param _release release timestamp
     * @return true if the transfer was succeeded
     */
    function transferWithLockup(address _to, uint256 _value, uint256 _release) external onlyLockupAuthorized returns (bool) {    
        _lockup(_to, _value, _release);
        return super.transfer(_to, _value);
    }

    /**
     * @dev Burn all tokens, remaining on sale contract
     */
    function burnSaleTokens() external onlySale {
        uint256 _amount = balances[sale];
        balances[sale] = 0;
        totalSupply_ = totalSupply_.sub(_amount);
        emit Burn(sale, _amount);
        emit Transfer(sale, address(0), _amount);        
    }

    /**
     * @dev Transfer tokens from one address to another
     * @param _to address which you want to transfer to
     * @param _value the amount of tokens to be transferred
     * @return true if the transfer was succeeded
     */
    function transfer(address _to, uint256 _value) public spotTransfer(msg.sender, _value) returns (bool) {
        return super.transfer(_to, _value);
    }

    /**
     * @dev Transfer tokens from one address to another
     * @param _from the address which you want to send tokens from
     * @param _to the address which you want to transfer to
     * @param _value the amount of tokens to be transferred
     * @return true if the transfer was succeeded
     */
    function transferFrom(address _from, address _to, uint256 _value) public spotTransfer(_from, _value) returns (bool) {    
        return super.transferFrom(_from, _to, _value);
    }

    /**
     * @dev Get balance spot for the current moment of time
     * @param _who address owns balance spot
     * @return balance spot for the current moment of time     
     */   
    function balanceSpot(address _who) public view returns (uint256) {
        return balanceOf(_who).sub(balanceVested(_who)).sub(balanceLockedUp(_who));
    }     

}