pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./SKYFToken.sol";

contract SKYFNetworkDevelopmentFund is Ownable{
    using SafeMath for uint256;

    uint public constant startTime = 1534334400;
    uint public firstYearEnd = startTime + 365 days;
    uint public secondYearEnd = firstYearEnd + 365 days;
    
    uint256 public initialSupply;
    SKYFToken public token;

    function setToken(address _token) public onlyOwner returns (bool) {
        require(_token != address(0));
        if (token == address(0)) {
            token = SKYFToken(_token);
            return true;
        }
        return false;
    }

    function transfer(address _to, uint256 _value) public onlyOwner returns (bool) {
        require(_to != address(0));
        require(now > startTime);
        uint256 balance = token.balanceOf(this);
        if (initialSupply == 0)
        {
            initialSupply = balance;
        }
        
        if (now < firstYearEnd) {
            require(balance.sub(_value).mul(2) >= initialSupply); //no less than 50%(1/2) should be left on account after first year
        }

        if (now < secondYearEnd) {
            require(balance.sub(_value).mul(20) >= initialSupply.mul(3)); //no less than 15%(3/20) should be left on account after second year
        }

        token.transfer(_to, _value);

    }


}