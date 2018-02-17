pragma solidity ^0.4.18;
import "zeppelin-solidity/contracts/token/StandardToken.sol";

contract SKYFToken is StandardToken {
  string public name = "SKYFToken"; 
  string public symbol = "SKYFT";
  uint public decimals = 18;
  uint public INITIAL_SUPPLY = 12 * (10 ** 8) * (10 ** decimals);

  function SKYFToken() public {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }
}