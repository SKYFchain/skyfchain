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
    uint256 public constant endTime = 1534334400;

    /**
     * @dev price for one token in USD in attodollars
     */
    uint256 public usdPrice = 65 * 10 ** 15;
    
    /**
     * @dev price for one ETH in USD in cents
     */    
    uint256 public etherUSDRate;

    /**
     * @dev amount of tokens for 1 ETH
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
    * @param _etherUSDRate Exchange rate ether to USD in cents
    * @param _tokenWallet Address holding the tokens, which has approved allowance to the crowdsale
    * @param _siteAccount Address of site account
    * @param _token Address of the token being sold
    */
    constructor(uint256 _etherUSDRate, address _tokenWallet, address _etherWallet, address _siteAccount, address _token) public {
        require(_token != address(0));
        require(_tokenWallet != address(0));
        require(_siteAccount != address(0));
        require(_etherWallet != address(0));
    
        setRate(_etherUSDRate);
        token = SKYFTokenInterface(_token);
        tokenWallet = _tokenWallet;
        etherWallet = _etherWallet;
        siteAccount = _siteAccount;
    }


    /**
    * @dev function changing ether to USD exchange rate
    * @param _etherUSDRate Exchange rate ether to USD in cents
    */
    function setRate(uint256 _etherUSDRate) public notEnded onlyOwner {
        require(_etherUSDRate != 0);
        // Don't allow to change rate drastically(protection from dimension error)
        require(etherUSDRate == 0 || _etherUSDRate.div(etherUSDRate) < 100 && etherUSDRate.div(_etherUSDRate) < 100);

        uint256 localRate = _etherUSDRate.mul(10 ** 16);
        require(localRate >= usdPrice);

        etherUSDRate = _etherUSDRate;
        
        rate = localRate.div(usdPrice);
    }


    /**
    * @dev function changing token price
    * @param _usdPrice Token price in attodollars 
    */
    function setPrice(uint256 _usdPrice) public notEnded onlyOwner {
        require(_usdPrice != 0);
        // Don't allow to change price drastically(protection from dimension error)
        require(usdPrice == 0 || _usdPrice.div(usdPrice) < 100 && usdPrice.div(_usdPrice) < 100);
        rate = rate.mul(usdPrice).div(_usdPrice);
        usdPrice = _usdPrice;

        
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
        require(_amount > 0);
        whitelist[_beneficiary] = true;

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
        
        token.finalize();

        emit Finalized();
        _kill();
    }

    /**
     * @dev killer method that can bu used by owner to
     *      kill the contract and send funds to owner
     */
    function _kill() internal onlyOwner {
        selfdestruct(etherWallet);
    }    
}
