pragma solidity ^0.4.23;

contract SKYFTokenInterface {
    function balanceOf(address _owner) public view returns (uint256 balance);
    function transfer(address _to, uint256 _value) public returns (bool);
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool);
    function isAirdrop(address _who) public view returns (bool result);
    function recalculateAirdrop(address _who) public;
    function finalize() public;
    function addAirdrop(address _wgi, address _beneficiary, uint256 _amount) public;
    function burnWallet(address _wallet, uint256 _amount) public;

    address public crowdsaleWallet;
    address public networkDevelopmentWallet;
    address public communityDevelopmentWallet;
    address public reserveWallet;
    address public bountyWallet;
    address public teamWallet;

    uint256 public crowdsaleSupply;
    uint256 public networkDevelopmentSupply;
    uint256 public communityDevelopmentSupply;
    uint256 public reserveSupply;
    uint256 public bountySupply;
    uint256 public teamSupply; 
}