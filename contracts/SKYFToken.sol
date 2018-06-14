pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title SKYFChain Tokens
 * @dev SKYFChain Token, ERC20 implementation, contract based on Zeppelin contracts:
 * Ownable, BasicToken, StandardToken, ERC20Basic, Burnable
*/
contract SKYFToken is Ownable {
    using SafeMath for uint256;
    using SafeMath for uint;
    
    enum State {Active, Finalized}
    State public state = State.Active;


    /**
     * @dev ERC20 descriptor variables
     */
    string public constant name = "SKYFChain";
    string public constant symbol = "SKYFT";
    uint8 public decimals = 18;

    uint public constant startTime = 1534334400;
    uint public airdropTime = startTime + 365 days;
    uint public shortAirdropTime = startTime + 182 days;
    
    
    uint256 public totalSupply_;

    uint256 public crowdsaleSupply;
    uint256 public networkDevelopmentSupply;
    uint256 public communityDevelopmentSupply;
    uint256 public reserveSupply;
    uint256 public bountySupply;
    uint256 public teamSupply; 

    address public crowdsaleWallet;
    address public networkDevelopmentWallet;
    address public communityDevelopmentWallet;
    address public reserveWallet;
    address public bountyWallet;
    address public teamWallet;

    
    address public crowdsaleContractAddress;
        
    //TODO Need better variable name
    address public siteAccount;

    mapping (address => mapping (address => uint256)) allowed;
    mapping (address => uint256) balances;
    mapping (address => uint256) airdrop;
    mapping (address => uint256) shortenedAirdrop;

        

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Burn(address indexed burner, uint256 value);

    /**
     * @dev Contract constructor
     */
    constructor(address _crowdsaleWallet
                , address _networkDevelopmentWallet
                , address _communityDevelopmentWallet
                , address _reserveWallet
                , address _bountyWallet
                , address _teamWallet
                , address _siteAccount) public {
        require(_crowdsaleWallet != address(0));
        require(_networkDevelopmentWallet != address(0));
        require(_communityDevelopmentWallet != address(0));
        require(_reserveWallet != address(0));
        require(_bountyWallet != address(0));
        require(_teamWallet != address(0));

        require(_siteAccount != address(0));

        crowdsaleWallet = _crowdsaleWallet;
        networkDevelopmentWallet = _networkDevelopmentWallet;
        communityDevelopmentWallet = _communityDevelopmentWallet;
        reserveWallet = _reserveWallet;
        bountyWallet = _bountyWallet;
        teamWallet = _teamWallet;

        siteAccount = _siteAccount;

         // 1200 millions of token overall
        totalSupply_ = 1200 * 10 ** 24;

        // Issue 528 millions crowdsale tokens
        crowdsaleSupply = 528 * 10 ** 24;
        _issueTokens(crowdsaleWallet, crowdsaleSupply);



        // Issue 180 millions network development tokens
        networkDevelopmentSupply = 180 * 10 ** 24;
        _issueTokens(networkDevelopmentWallet, networkDevelopmentSupply);

        // Issue 120 millions community development tokens
        communityDevelopmentSupply = 120 * 10 ** 24;
        _issueTokens(communityDevelopmentWallet, communityDevelopmentSupply);

        // Issue 114 millions reserve tokens
        reserveSupply = 114 * 10 ** 24;
        _issueTokens(reserveWallet, reserveSupply);

        // Issue 18 millions bounty tokens
        bountySupply = 18 * 10 ** 24;
        _issueTokens(bountyWallet, bountySupply);

        // Issue 240 millions team tokens
        teamSupply = 240 * 10 ** 24;
        _issueTokens(teamWallet, teamSupply);
    }

    function _issueTokens(address _to, uint256 _amount) internal {
        balances[_to] = balances[_to].add(_amount);
        emit Transfer(address(0), _to, _amount);
    }

    function _airdropUnlocked(address _who) internal view returns (bool) {
        return now > airdropTime 
        || (now > shortAirdropTime && airdrop[_who] == 0) 
        || shortenedAirdrop[msg.sender] == 0;
    }

    modifier erc20Allowed() {
        require(state == State.Finalized || msg.sender == crowdsaleContractAddress || msg.sender == siteAccount || msg.sender == crowdsaleWallet);
        require (_airdropUnlocked(msg.sender));
        _;
    }

    modifier onlyCrowdsaleContract() {
        require(msg.sender == crowdsaleContractAddress);
        _;
    }
    
    function setCrowdsaleContractAddress(address _address) public onlyOwner returns (bool result) {
        require(_address != address(0));
        if (crowdsaleContractAddress == address(0)) {
            crowdsaleContractAddress = _address;
            return true;
        }
        return false;
    }

    /**
     * @dev Gets the balance of the specified address.
     * @param _owner The address to query the the balance of.
     * @return An uint256 representing the amount owned by the passed address.
    */
    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }


    /**
     * @dev total number of tokens in existence
    */
    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

    /**
    * @dev transfer token for a specified address
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    */
    function transfer(address _to, uint256 _value) public erc20Allowed returns (bool) {
        require(_to != address(0));

        require(_airdropUnlocked(_to));

        // SafeMath.sub will throw if there is not enough balance.
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     */
    function transferFrom(address _from, address _to, uint256 _value) public erc20Allowed returns (bool) {
        return _transferFrom(msg.sender, _from, _to, _value);
    }

    function _transferFrom(address _who, address _from, address _to, uint256 _value) internal returns (bool) {
        require(_to != address(0));
        require(_airdropUnlocked(_to) || _from == crowdsaleWallet);
        
        

        uint256 _allowance = allowed[_from][_who];

        // Check is not needed because sub(_allowance, _value) will already throw if this condition is not met
        // require (_value <= _allowance);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][_who] = _allowance.sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     *
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param _spender The address which will spend the funds.
     * @param _value The amount of tokens to be spent.
     */
    function approve(address _spender, uint256 _value) public erc20Allowed returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }


    /**
     * @dev Function to check the amount of tokens that an owner allowed to a spender.
     * @param _owner address The address which owns the funds.
     * @param _spender address The address which will spend the funds.
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowed[_owner][_spender];
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     *
     * approve should be called when allowed[_spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param _spender The address which will spend the funds.
     * @param _addedValue The amount of tokens to increase the allowance by.
    */
    function increaseApproval(address _spender, uint _addedValue) public erc20Allowed returns (bool) {
        allowed[msg.sender][_spender] = (allowed[msg.sender][_spender].add(_addedValue));
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
     *
     * approve should be called when allowed[_spender] == 0. To decrement
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param _spender The address which will spend the funds.
     * @param _subtractedValue The amount of tokens to decrease the allowance by.
    */
    function decreaseApproval(address _spender, uint _subtractedValue) public erc20Allowed returns (bool) {
        uint oldValue = allowed[msg.sender][_spender];
        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    /**
     * @dev Burns a specific amount of tokens.
     * @param _value The amount of token to be burned.
    */
    function burn(uint256 _value) public erc20Allowed {
        _burn(msg.sender, _value);
    }

    function _burn(address _who, uint256 _value) internal {
        require(_value <= balances[_who]);
        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure

        balances[_who] = balances[_who].sub(_value);
        totalSupply_ = totalSupply_.sub(_value);
        emit Burn(_who, _value);
        emit Transfer(_who, address(0), _value);
    }

    function finalize() public onlyCrowdsaleContract {
        require(state == State.Active);
        state = State.Finalized;

        uint256 crowdsaleBalance = balanceOf(crowdsaleWallet);

        uint256 burnAmount = networkDevelopmentSupply.mul(crowdsaleBalance).div(crowdsaleSupply);
        _burn(networkDevelopmentWallet, burnAmount);

        burnAmount = communityDevelopmentSupply.mul(crowdsaleBalance).div(crowdsaleSupply);
        _burn(communityDevelopmentWallet, burnAmount);

        burnAmount = reserveSupply.mul(crowdsaleBalance).div(crowdsaleSupply);
        _burn(reserveWallet, burnAmount);

        burnAmount = bountySupply.mul(crowdsaleBalance).div(crowdsaleSupply);
        _burn(bountyWallet, burnAmount);

        burnAmount = teamSupply.mul(crowdsaleBalance).div(crowdsaleSupply);
        _burn(teamWallet, burnAmount);

        _burn(crowdsaleWallet, crowdsaleBalance);
    }
    
    function addAirdrop(address _who, address _beneficiary, uint256 _amount) public onlyCrowdsaleContract {
        if (shortenedAirdrop[_beneficiary] != 0) {
            shortenedAirdrop[_beneficiary] += _amount;
        }
        else {
            airdrop[_beneficiary] = airdrop[_beneficiary] + _amount;
        }
        _transferFrom(_who, crowdsaleWallet, _beneficiary, _amount);
        
    }

    function isAirdrop(address _who) public view returns (bool result) {
        return airdrop[_who] > 0 || shortenedAirdrop[_who] > 0;
    }

    function recalculateAirdrop(address _who) public onlyCrowdsaleContract {
        uint256 initialAmount = airdrop[_who];
        if (initialAmount > 0) {
            uint256 rate = balances[_who].div(initialAmount);
            if (rate > 4) {
                delete airdrop[_who];
            } else if (rate > 2) {
                delete airdrop[_who];
                shortenedAirdrop[_who] = initialAmount;
            }
        } else {
            initialAmount = shortenedAirdrop[_who];
            if (initialAmount > 0) {
                rate = balances[_who].div(initialAmount);
                if (rate > 4) {
                    delete shortenedAirdrop[_who];
                }
            }
        }
    }

    
}
