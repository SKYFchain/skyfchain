pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./SKYFTokenInterface.sol";

contract SKYFReserveFund is Ownable{
    uint256 public constant startTime = 1534334400;
    uint256 public constant firstYearEnd = startTime + 365 days;
    
    SKYFTokenInterface public token;

    function setToken(address _token) public onlyOwner returns (bool) {
        require(_token != address(0));
        if (token == address(0)) {
            token = SKYFTokenInterface(_token);
            return true;
        }
        return false;
    }

    function transfer(address _to, uint256 _value) public onlyOwner returns (bool) {
        require(now > firstYearEnd);

        token.transfer(_to, _value);

    }
}
