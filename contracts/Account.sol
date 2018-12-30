pragma solidity ^0.4.17;
contract Account{
    struct OwnedIndex {
        uint index;
        bool active;
    }

    struct Account {
        address owner;
        uint treeCounter;
        uint orderCounter;

        mapping (uint=>uint) orders;
        mapping (uint=>OwnedIndex) ownedTree;
    }
    //种树请求者
    struct Asker{
        Account account;
        uint askId;
        uint orderCounter;
        mapping (uint=>uint) sendOrder;
    }
    //种树人
    struct Planter{
        Account account;
        uint plantId;
        uint treeCounter;
        mapping (uint=>uint) plantedTree;    
    }
    //种树人的信息列表
    uint internal planterCounter = 1;
    mapping (address => uint) internal planterIndex;
    mapping (uint=>Planter) internal planters;
    //种树请求者列表
    uint internal askerCounter = 1;
    mapping (address=>uint) internal askerIndex;
    mapping (uint=>Asker) internal askers;

    modifier validPlanter(uint index) {
        require(index < planterCounter);
        _;
    }

    modifier validAsker(uint index) {
        require(index < askerCounter);
        _;
    }

    function createPlanter() public {
        require(planterIndex[msg.sender] == 0);
        planters[planterCounter] = Planter(Account(msg.sender, 0, 0), planterCounter, 0);
        planterIndex[msg.sender] = planterCounter;
        planterCounter ++;
    }

    function createAsker() public {
        require(askerIndex[msg.sender] == 0);
        askers[askerCounter] = Asker(Account(msg.sender, 0, 0), askerCounter, 0);
        askerIndex[msg.sender] = askerCounter;
        askerCounter ++;
    }

    function getPlanterCounter() public view returns (uint){
        return planterCounter - 1;
    }

    function getAskerCounter() public view returns (uint) {
        return askerCounter - 1;
    }

    //获取种树人的序号
    function getPlanterIndex(address owner) public view returns (uint) {
        require(planterIndex[owner] != 0);
        return planterIndex[owner];
    }
    //获取种树请求者序号
    function getAskerIndex(address owner) public view returns (uint) {
        require(askerIndex[owner] != 0);
        return askerIndex[owner];
    }
    //树农地址
    function getPlanterAddress(uint index) public view returns (address) {
        require(index < planterCounter);
        return planters[index].account.owner;
    }
    //种树请求者地址
    function getAskerAddress(uint index) public view returns (address) {
        require(index < askerCounter);
        return askers[index].account.owner;
    }
    //在树农名下的树的总量
    function getPlanterOwnedTreeCounter(uint index) public view returns (uint) {
        require(index < planterCounter);
        return planters[index].account.treeCounter;
    }
    //树农种下的树的总量
    function getPlanterTreeCounter(uint index) public view returns (uint) {
        require(index < planterCounter);
        return planters[index].treeCounter;
    }
    //在种树请求者名下的树的总量
    function getAskerOwnedTreeCounter(uint index) public view returns (uint) {
        require(index < askerCounter);
        return askers[index].account.treeCounter;
    }
    
    function getPlanterOrderCounter(uint index) public view returns (uint) {
        require(index < planterCounter);
        return planters[index].account.orderCounter;
    }

    function getAskerOrderCounter(uint index) public view returns (uint) {
        require(index < askerCounter);
        return askers[index].account.orderCounter;
    }
    //获取种树请求者发起的交易数
    function getAskerCreateOrderCounter(uint index) public view returns (uint) {
        require(index < askerCounter);
        return askers[index].orderCounter;
    }
    //获取当前种树人
    function getPlanter(uint index) internal view returns (Planter) {
        require(index < planterCounter);
        return planters[index];
    }
    //获取当前种树请求者
    function getAsker(uint index) internal view returns (Asker) {
        require(index < askerCounter);
        return askers[index];
    }
    //获取种树人种下的指定树
    function getPlanterTree(uint planter, uint index) public view returns (uint) {
        require(index < getPlanterTreeCounter(planter));
        return planters[planter].plantedTree[index];
    }
    //获取种树人名下的指定树
    function getPlanterOwnedTree(uint planter, uint index) public view returns (uint, bool) {
        require(index < getPlanterOwnedTreeCounter(planter));
        return (planters[planter].account.ownedTree[index].index, planters[planter].account.ownedTree[index].active);
    }
    //获取种树请求者名下指定树
    function getAskerOwnedTree(uint asker, uint index) public view returns (uint, bool) {
        require(index < getAskerOwnedTreeCounter(asker));
        return (askers[asker].account.ownedTree[index].index, askers[asker].account.ownedTree[index].active);
    }

    function getPlanterOrder(uint planter, uint index) public view returns (uint) {
        require(index < getPlanterOrderCounter(planter));
        return planters[planter].account.orders[index];
    }

    function getAskerOrder(uint asker, uint index) public view returns (uint) {
        require(index < getAskerOrderCounter(asker));
        return askers[asker].account.orders[index];
    }
    //获取种树请求者发出的指定交易
    function getAskerCreateOrder(uint asker, uint index) public view returns (uint) {
        require(index < getAskerCreateOrderCounter(asker));
        return askers[asker].sendOrder[index];
    }



}