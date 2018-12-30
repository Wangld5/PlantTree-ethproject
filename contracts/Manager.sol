pragma solidity ^0.4.17;
import "./Account.sol";
import "./Order.sol";
import "./TreeMessage.sol";

contract Manager is TreeMessage, Order, Account {
    //Tree Manager
    function _plantTree(string treeName, bytes32 treeFullMess) public {
        uint planterIndex = getPlanterIndex(msg.sender);
        uint treeIndex = plantTree(msg.sender, treeName, treeFullMess);
        planters[planterIndex].plantedTree[planters[planterIndex].treeCounter] = treeIndex;
        _addPlanterOwnedTree(planterIndex, treeIndex);
        planters[planterIndex].treeCounter++;
    }

    function _addPlanterOwnedTree(uint planterIndex, uint treeIndex) internal validPlanter(planterIndex) validTree(treeIndex){
        planters[planterIndex].account.ownedTree[planters[planterIndex].account.treeCounter] = OwnedIndex(treeIndex, true);
        planters[planterIndex].account.treeCounter++;
    }

    function _addAskerOwnedTree(uint askerIndex, uint treeIndex) internal validAsker(askerIndex) validTree(treeIndex) {
        askers[askerIndex].account.ownedTree[askers[askerIndex].account.treeCounter] = OwnedIndex(treeIndex, true);    
        askers[askerIndex].account.treeCounter++;
    }

    function _removePlanterOwnedTreeAt(uint planterIndex, uint treeIndex) internal validPlanter(planterIndex) {
        require(treeIndex < getPlanterOwnedTreeCounter(planterIndex));
        planters[planterIndex].account.ownedTree[treeIndex].active = false;
    }
    //Order Manager
    function _createOrder(address planter) public payable {
        uint planterId = getPlanterIndex(planter);
        uint askerId = getAskerIndex(msg.sender);
        uint orderId = createOrder(planter, msg.value);
        planters[planterId].account.orders[planters[planterId].account.orderCounter++] = orderId;
        askers[askerId].sendOrder[askers[askerId].orderCounter++] = orderId;
    }

    function _finishOrder(uint treeIndex, uint orderIndex) public {
        uint temp_treeIndex;
        bool ownerJudge;

        order storage myorder = getOrder(orderIndex);
        uint planterId = getPlanterIndex(msg.sender);
        uint askerId = getAskerIndex(myorder.asker);

        (temp_treeIndex, ownerJudge) = getPlanterOwnedTree(planterId, treeIndex);
        require(ownerJudge);
        changeOwner(temp_treeIndex, myorder.asker);
        finishOrder(orderIndex);
        _addAskerOwnedTree(askerId, temp_treeIndex);
        _removePlanterOwnedTreeAt(planterId, treeIndex);
        
    }


    
}
