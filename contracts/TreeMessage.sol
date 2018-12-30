pragma solidity ^0.4.16;
contract TreeMessage {

    struct message{
        string treeName;
        bytes32 treeFullMessage;
    }

    struct tree{
        address planter;
        address owner;
        message treeContent;
    }

    uint treeCounter = 0;
    
    mapping (uint=>tree) Trees;

    modifier validTree(uint index){
        require(index < treeCounter);
        _;
    }

    function plantTree(address planter, string treeName, bytes32 treeMess) internal returns(uint){
        Trees[treeCounter] = tree(planter, planter, message(treeName, keccak256(abi.encodePacked(treeMess))));
        return treeCounter++;
    }

    function getTree(uint index) public view returns(string) {
        require(index < treeCounter);
        return Trees[index].treeContent.treeName;
    }

    function changeOwner(uint index, address targetOwner) internal {
        require(index < treeCounter);
        require(Trees[index].owner == msg.sender);
        Trees[index].owner = targetOwner;
    }

    function verifyTreeMessage(uint index, string treeMsg) public view returns(bool){
        require(index < treeCounter);
        return(Trees[index].treeContent.treeFullMessage == keccak256(abi.encodePacked(keccak256(abi.encodePacked(treeMsg)))));
    }

}
