pragma solidity ^0.4.17;


contract Order {
    enum state {finished, unfinished}

    struct order {
        address planter;
        address asker;
        uint price;
        state st;
    }

    uint internal orderCounter = 0;

    mapping (uint=>order) internal orders;

    function createOrder(address planter, uint price) internal returns(uint) {
        orders[orderCounter] = order(planter, msg.sender, price, state.unfinished);
        return orderCounter++;
    }

    function finishOrder(uint index) internal {
        require(index < orderCounter);
        require(orders[index].planter == msg.sender);
        require(orders[index].st == state.unfinished);
        msg.sender.transfer(orders[index].price);
        orders[index].st = state.finished;
    }

    function getOrder(uint index) internal view returns(order storage) {
        require(index < orderCounter);
        return orders[index];
    }

    function getOrdersAddr(uint index) public view returns (address, address, uint, bool) {
        require(index < orderCounter);
        return (orders[index].planter, orders[index].asker, orders[index].price, orders[index].st == state.finished);
    }

}