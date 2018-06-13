pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./SKYFTokenInterface.sol";



contract SKYFCrowdsale is Ownable{
    using SafeMath for uint256;

    /**
     * @dev event that emiited upon finalization method finish
     */
    SKYFTokenInterface public token;

    /**
     * @dev ICO end time which is Wednesday, August 15, 2018 12:00:00 PM GMT
     */
    uint public constant endTime = 1534334400;

    /**
     * @dev price for one token in USD
     */
    uint256 public constant dollarPrice = 65 * 10 ** 15;//in attodollars
    
    /**
     * @dev price for one ETH in USD
     */    
    uint256 public etherDollarRate;

    /**
     * @dev amount of tokens for 1 wei
     */
    uint256 public rate;

    /**
     * @dev the whole amount of raised ETH in wei
     */
    uint256 public weiRaised;

    /**
     * @dev list of participants who can buy tokens
     */
    mapping(address => bool) public whitelist;

    /**
     * @dev ethereum account that holds all the crowdsale tokens
     */
    address public tokenWallet;

    /**
     * @dev ethereum account where all the ETH goes
     */
    address public etherWallet;

    /**
     * @dev ethereum account used by skyf account backend service
     */
    address public siteAccount;


    /**
     * @dev event that emiited upon finalization method finish
     */
    event Finalized();

    /**
     * @dev event that emiited on any token purchase
     */
    event TokenPurchase(address indexed purchaser, uint256 value, uint256 amount);

    /**
     * @dev event that emiited on adding air drop account
     */
    event AirDrop(address indexed beneficiary, uint256 amount);
    
    /**
    * @param _etherDollarRate Exchange rate ether to USD
    * @param _tokenWallet Address holding the tokens, which has approved allowance to the crowdsale
    * @param _siteAccount Address of site account
    * @param _token Address of the token being sold
    */
    constructor(uint256 _etherDollarRate, address _tokenWallet, address _etherWallet, address _siteAccount, address _token) public {
        require(_token != address(0));
        require(_tokenWallet != address(0));
        require(_siteAccount != address(0));
        require(_etherWallet != address(0));
    
        setRate(_etherDollarRate);
        token = SKYFTokenInterface(_token);
        tokenWallet = _tokenWallet;
        etherWallet = _etherWallet;
        siteAccount = _siteAccount;
    }


    /**
    * @dev function changing ether to USD exchange rate
    * @param _etherDollarRate Exchange rate ether to USD
    */
    function setRate(uint256 _etherDollarRate) public notEnded onlyOwner {
        uint256 localRate = _etherDollarRate.mul(10 ** 16);
        require(localRate >= dollarPrice);

        etherDollarRate = localRate;
        rate = etherDollarRate.div(dollarPrice);
    }

    /**
    * @dev Catch token purchase function
    */
    function () external payable notEnded {
        buyTokens(msg.sender);
    }

    /**
    * @dev Token purchase function
    * @param _beneficiary address, may differ from payer one
    */
    function buyTokens(address _beneficiary) public payable notEnded {
        require(whitelist[_beneficiary]);
        uint256 weiAmount = msg.value;
        
        uint256 tokenAmount = weiAmount.mul(rate);

        // update state
        weiRaised = weiRaised.add(weiAmount);

        token.transferFrom(tokenWallet, _beneficiary, tokenAmount);
        emit TokenPurchase(
        _beneficiary,
        weiAmount,
        tokenAmount
        );


        etherWallet.transfer(weiAmount);
        if (token.isAirdrop(_beneficiary)) {
            token.recalculateAirdrop(_beneficiary);
        }
    }

    /**
    * @dev modifier that checks if crowdsale is ended
    */
    modifier notEnded {
        require(now < endTime);
        _;
    }

    /**
    * @dev Add airdrop user and provide him tokens
    * @param _beneficiary Address getting airdrop tokens
    * @param _amount Amount of tokens being provided
    */
    function createAirdrop(address _beneficiary, uint256 _amount) public notEnded ownerOrSiteAccount {
        require(_beneficiary != address(0));
        require(!token.isAirdrop(_beneficiary));
        require(_amount > 0);
        
        address sender;
        if (msg.sender == owner) {
            sender = this;
        } else {
            sender = msg.sender;
        }
        token.addAirdrop(sender, _beneficiary, _amount);

        emit AirDrop(_beneficiary, _amount);
    }

    modifier ownerOrSiteAccount() {
        require(msg.sender == owner || msg.sender == siteAccount);
        _;
    }

    /**
    * @dev Adds single address to whitelist.
    * @param _beneficiary Address to be added to the whitelist
    */
    function addToWhitelist(address _beneficiary) external notEnded ownerOrSiteAccount {
        require(_beneficiary != address(0));
        whitelist[_beneficiary] = true;
    }

    /**
    * @dev Removes single address from whitelist.
    * @param _beneficiary Address to be removed to the whitelist
    */
    function removeFromWhitelist(address _beneficiary) external notEnded ownerOrSiteAccount {
        require(_beneficiary != address(0));
        delete whitelist[_beneficiary];
    }

    /**
    * @dev Must be called after crowdsale ends, to change token state and burn funds proportionally.
    * Also self destruct this contract.
    */
    function finalize() onlyOwner public {
        require(now > endTime);

        

        uint256 crowdsaleBalance = token.balanceOf(token.crowdsaleWallet());
        uint256 crowdsaleSupply = token.crowdsaleSupply();

        _burnWallet(token.networkDevelopmentWallet(), token.networkDevelopmentSupply(), crowdsaleBalance, crowdsaleSupply);
        _burnWallet(token.communityDevelopmentWallet(), token.communityDevelopmentSupply(), crowdsaleBalance, crowdsaleSupply);
        _burnWallet(token.reserveWallet(), token.reserveSupply(), crowdsaleBalance, crowdsaleSupply);
        _burnWallet(token.bountyWallet(), token.bountySupply(), crowdsaleBalance, crowdsaleSupply);
        _burnWallet(token.teamWallet(), token.teamSupply(), crowdsaleBalance, crowdsaleSupply);

        token.burnWallet(tokenWallet, crowdsaleBalance);

        token.finalize();

        emit Finalized();
        _kill();
    }

    /**
     * @dev helper method that 
     *      kill the contract and send funds to owner
     */
    function _burnWallet(address _wallet, uint256 _supply, uint256 _crowdsaleBalance, uint256 _crowdsaleSupply) internal {
        uint256 burnAmount = _supply.mul(_crowdsaleBalance).div(_crowdsaleSupply);
        token.burnWallet(_wallet, burnAmount);
    }

    /**
     * @dev killer method that can bu used by owner to
     *      kill the contract and send funds to owner
     */
    function _kill() internal onlyOwner {
        selfdestruct(etherWallet);
    }    
}
