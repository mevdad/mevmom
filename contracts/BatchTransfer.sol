// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BatchTransfer {
    address public owner;
    
    event TransferExecuted(address indexed from, address indexed to, uint256 amount);
    event BatchExecuted(address[] from, address to, uint256[] amounts, uint256 totalAmount);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
       _;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        owner = newOwner;
    }
    
    // Function to transfer ETH to a destination address
    function transfer(address payable destination) external payable {
        require(msg.value > 0, "Must send ETH to transfer");
        emit TransferExecuted(msg.sender, destination, msg.value);
        (bool success, ) = destination.call{value: msg.value}("");
        require(success, "Transfer failed");
    }
    
    // Owner can execute a batched transfer from multiple signers to a single destination
    function executeBatchTransfer(
        address[] calldata signers,
        bytes[] calldata signatures,
        uint256[] calldata amounts,
        address payable destination,
        bytes32 messageHash
    ) external onlyOwner {
        require(signers.length == signatures.length && signatures.length == amounts.length, "Array length mismatch");
        require(destination != address(0), "Invalid destination");
        
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < signers.length; i++) {
            // Verify signature
            bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
            address recoveredSigner = recoverSigner(ethSignedMessageHash, signatures[i]);
            require(recoveredSigner == signers[i], "Invalid signature");
            
            totalAmount += amounts[i];
        }
        
        emit BatchExecuted(signers, destination, amounts, totalAmount);
    }
    
    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }
    
    function splitSignature(bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        
        if (v < 27) {
            v += 27;
        }
        
        return (r, s, v);
    }
    
    // Function to receive ETH
    receive() external payable {}
}
