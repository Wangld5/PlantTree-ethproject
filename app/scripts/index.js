// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import manager from '../../build/contracts/Manager.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
window.Manager = contract(manager);
window.managerInstance = null;

let main = new Vue({
        el: '#main',
        data: {
            current: null, //check which part, 1->Tree, 2->transac
            loadMain: false,
            loginStatus: false,
            //login dialog
            loginDialogVisiable: false,
            isAsker: false,
            isPlanter: false,
            currentActor: undefined,
            //0->planter
            //1->asker
            actorType: null,
            actorIndex: 0,
            //tree message
            TreeLabel: "owned",
            trees: [],
            plantDialogVisiable: false,
            newTree: {
                treeName: '',
                treeMessage: '',
            },
            verifyTreeIndex: 0,
            verifyDialogVisiable: false,
            toVerify: {
                treeName: '',
                treeMessage: '',
            },
            //transac
            orderLabel: 'received',
            orders: [],
            sendOrderDialogVisiable: false,
            newOrder: {
                to: '',
                price: '',
            },
            finishOrderIndex: 0,
            finishOrderDialogVisiable: false,
            ownedTrees: [],
            chosenTree: null,
            loadChoose: false,
            gainedCoin: 0,

        },
        methods: {
            menuSelect: function(key, keyPath) {
                this.current = key;
                switch (key) {
                    case '1':
                        this.TreeLabel = 'owned';
                        //handler method
                        this.loadOwnedTree();
                        break;
                    case '2':
                        this.orderLabel = 'received';
                        this.loadReceivedOrder();
                        break;
                }
            },
            homeButtonClicked: function() {
                document.getElementById("scrollContainer").scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
            },
            //show tree message
            treeTabClicked: function(key, event) {
                if (this.TreeLabel === 'owned') {
                    this.loadOwnedTree();
                } else {
                    this.loadPlantedTree();
                }
            },
            //show order
            orderTabClicked: function(key, event) {
                if (this.orderLabel === 'received') {
                    this.loadReceivedOrder();
                } else {
                    this.loadSentOrder();
                }
            },
            loadOwnedTree: function() {
                this.loadMain = true;
                this.trees.length = 0;
                ((this.actorType === 0) ? managerInstance.getPlanterOwnedTreeCounter(this.actorIndex) :
                    managerInstance.getAskerOwnedTreeCounter(this.actorIndex))
                .then(result => {
                        let ownedCount = result.toNumber();
                        if (ownedCount === 0) {
                            this.loadMain = false;
                            return;
                        }
                        let doneCount = 0;
                        for (let i = 0; i < ownedCount; i++) {
                            let personalIndex = Number(i);
                            ((this.actorType === 0) ? managerInstance.getPlanterOwnedTree(this.actorIndex, personalIndex) :
                                managerInstance.getAskerOwnedTree(this.actorIndex, personalIndex))
                            .then(result => {
                                    let resultIndex = result[0].toNumber();
                                    if (result[1] === true) {
                                        managerInstance.getTree(resultIndex)
                                            .then(result => {
                                                let lines = result;
                                                this.trees.push({
                                                    treeId: resultIndex,
                                                    treeName: lines,
                                                })
                                            })
                                            .catch(error => {
                                                console.log(error);
                                            })
                                            .then(() => {
                                                if (++doneCount === ownedCount) {
                                                    this.loadMain = false;
                                                }
                                            })
                                    } else {
                                        if (++doneCount === ownedCount) {
                                            this.loadMain = false;
                                        }
                                    }
                                })
                                .catch(error => {
                                    console.log(error);
                                    if (++doneCount === ownedCount) {
                                        this.loadMain = false;
                                    }
                                })
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        this.loadMain = false;
                    })

            },
            loadPlantedTree: function() {
                this.loadMain = true;
                this.trees.length = 0;
                managerInstance.getPlanterTreeCounter(this.actorIndex)
                    .then(result => {
                        let createdCount = result.toNumber();
                        if (createdCount === 0) {
                            this.loadMain = false;
                            return;
                        }
                        let doneCount = 0;
                        for (let i = 0; i < createdCount; i++) {
                            let personalIndex = Number(i);
                            managerInstance.getPlanterTree(this.actorIndex, personalIndex)
                                .then(result => {
                                    let resultIndex = result.toNumber();
                                    managerInstance.getTree(resultIndex)
                                        .then(result => {
                                            let lines = result;
                                            this.trees.push({
                                                treeId: resultIndex,
                                                treeName: lines,
                                            })
                                        })
                                        .catch(error => {
                                            console.log(error);
                                        })
                                        .then(() => {
                                            if (++doneCount === createdCount) {
                                                this.loadMain = false;
                                            }
                                        })
                                })
                                .catch(error => {
                                    console.log(error);
                                    if (++doneCount === createdCount) {
                                        this.loadMain = false;
                                    }
                                })
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        this.loadMain = false;
                    })
            },
            planterClicked: function() {
                this.isPlanter = true;
                if (web3.eth.accounts[0] === undefined) {
                    this.$message.error("Error: No avaliable account");
                    console.log("Error: No avaliable account");
                    this.isPlanter = false;
                } else {
                    managerInstance.getPlanterIndex(web3.eth.accounts[0])
                        .then(result => {
                            this.$message.success("welcome planter" + web3.eth.accounts[0]);
                            this.loginStatus = true;
                            this.current = '0';
                            this.isPlanter = false;
                            this.loginDialogVisiable = false;
                            this.currentActor = web3.eth.accounts[0];
                            this.actorType = 0;
                            this.actorIndex = result.toNumber();
                        })
                        .catch(error => {
                            this.$message.info("creating a planter account");
                            managerInstance.createPlanter({ from: web3.eth.accounts[0] })
                                .then(result => {
                                    this.planterClicked();
                                })
                                .catch(error => {
                                    this.$message.error("fail to create a planter account");
                                    this.isPlanter = false;
                                });
                        })
                }
            },
            askerClicked: function() {
                this.isAsker = true;
                if (web3.eth.accounts[0] === undefined) {
                    this.$message.error("Error: No avaliable account");
                    console.log("Error: No avaliable account");
                    this.isAsker = false;
                } else {
                    managerInstance.getAskerIndex(web3.eth.accounts[0])
                        .then(result => {
                            this.$message.success("welcome asker" + web3.eth.accounts[0]);
                            this.loginStatus = true;
                            this.current = '0';
                            this.isAsker = false;
                            this.loginDialogVisiable = false;
                            this.currentActor = web3.eth.accounts[0];
                            this.actorType = 1;
                            this.actorIndex = result.toNumber();
                        })
                        .catch(error => {
                            this.$message.info("creating a asker account");
                            managerInstance.createAsker({ from: web3.eth.accounts[0] })
                                .then(result => {
                                    this.askerClicked();
                                })
                                .catch(error => {
                                    this.$message.error("fail to create a asker account");
                                    this.isAsker = false;
                                });
                        })
                }
            },
            plantTree: function() {
                this.$refs['newTreeForm'].validate((valid) => {
                    if (valid) {
                        let treeMess = this.newTree.treeMessage;
                        let treeNam = this.newTree.treeName;
                        this.$message.info("planting tree...");
                        managerInstance._plantTree(treeNam, web3.sha3(treeMess), { from: web3.eth.accounts[0] })
                            .then(result => {
                                this.$message.success("your tree has been planted");
                                this.newTree.treeName = '';
                                this.newTree.treeMessage = '';
                                this.plantDialogVisiable = false;
                                this.loadPlantedTree();
                            })
                            .catch(error => {
                                this.$message.error("plant tree fail");
                                console.log(error);
                            });
                        return false;
                    } else {
                        this.$message.warning("some mistake happened");
                        return false;
                    }
                });
            },
            //order system
            loadReceivedOrder: function() {
                this.loadMain = true;
                this.orders.length = 0;
                ((this.actorType === 0) ? managerInstance.getPlanterOrderCounter(this.actorIndex) :
                    managerInstance.getAskerOrderCounter(this.actorIndex))
                .then(result => {
                        let receivedCount = result.toNumber();
                        if (receivedCount === 0) {
                            this.loadMain = false;
                            return;
                        }
                        let doneCount = 0;
                        for (let i = 0; i < receivedCount; i++) {
                            let personalIndex = Number(i);
                            ((this.actorType === 0) ? managerInstance.getPlanterOrder(this.actorIndex, personalIndex) :
                                managerInstance.getAskerOrder(this.actorIndex, personalIndex))
                            .then(result => {
                                    let resultIndex = result.toNumber();
                                    managerInstance.getOrdersAddr(resultIndex)
                                        .then(result => {
                                            this.orders.push({
                                                orderId: resultIndex,
                                                to: result[0],
                                                from: result[1],
                                                price: web3.fromWei(result[2].toNumber(), "ether"),
                                                isDone: result[3],
                                            })
                                        })
                                        .catch(error => {
                                            this.$message.error("fail to query order content");
                                            console.log(error);
                                        })
                                        .then(() => {
                                            if (++doneCount === receivedCount) {
                                                this.loadMain = false;
                                            }
                                        })
                                })
                                .catch(error => {
                                    this.$message.error("fail to query order index");
                                    console.log(error);
                                    if (++doneCount === receivedCount) {
                                        this.loadMain = false;
                                    }
                                })
                        }
                    })
                    .catch(error => {
                        this.$message.error("fail to query order count");
                        console.log(error);
                        this.loadMain = false;
                    })
            },
            loadSentOrder: function() {
                this.loadMain = true;
                this.orders.length = 0;
                managerInstance.getAskerCreateOrderCounter(this.actorIndex)
                    .then(result => {
                        let sentCount = result.toNumber();
                        if (sentCount === 0) {
                            this.loadMain = false;
                            return;
                        }
                        let doneCount = 0;
                        for (let i = 0; i < sentCount; i++) {
                            let personalIndex = Number(i);
                            managerInstance.getAskerCreateOrder(this.actorIndex, personalIndex)
                                .then(result => {
                                    let resultIndex = result.toNumber();
                                    managerInstance.getOrdersAddr(resultIndex)
                                        .then(result => {
                                            this.orders.push({
                                                orderId: resultIndex,
                                                to: result[0],
                                                from: result[1],
                                                price: web3.fromWei(result[2].toNumber(), "ether"),
                                                isDone: result[3],
                                            })
                                        })
                                        .catch(error => {
                                            this.$message.error("fail to query order");
                                        })
                                        .then(() => {
                                            if (++doneCount === receivedCount) {
                                                this.loadMain = false;
                                            }
                                        })
                                })
                                .catch(error => {
                                    this.$message.error("fail to query order id");
                                    if (++doneCount === receivedCount) {
                                        this.loadMain = false;
                                    }
                                })
                        }
                    })
                    .catch(error => {
                        this.$message.error("fail to query order count");
                        this.loadMain = false;
                    })
            },
            sendOrder: function() {
                this.$refs['newOrderForm'].validate((valid) => {
                    if (valid) {
                        let orderTo = this.newOrder.to;
                        let orderPrice = this.newOrder.price;
                        this.$message.info("sending order...");
                        managerInstance._createOrder(orderTo, {
                                from: this.currentActor,
                                value: web3.toWei(orderPrice, "ether"),
                            })
                            .then(result => {
                                this.$message.success("order has been sent");
                                this.newOrder.price = 0;
                                this.newOrder.to = '';
                                this.sendOrderDialogVisiable = false;
                                this.loadSentOrder();
                            })
                            .catch(error => {
                                this.$message.error("fail to send order");
                            })
                        return false;
                    } else {
                        this.$message.warning("some mistake happened");
                        return false;
                    }
                });
            },
            finishOrderClicked: function(orderId, price) {
                this.finishOrderDialogVisiable = true;
                this.finishOrderIndex = orderId;
                this.gainedCoin = price;
                this.loadChooseOwnedTrees();
            },
            loadChooseOwnedTrees: function() {
                this.loadChoose = true;
                this.ownedTrees.length = 0;
                ((this.actorType === 0) ? managerInstance.getPlanterOwnedTreeCounter(this.actorIndex) :
                    managerInstance.getAskerOwnedTreeCounter(this.actorIndex))
                .then(result => {
                        let ownedCount = result.toNumber();
                        if (ownedCount === 0) {
                            this.loadChoose = false;
                            return;
                        }
                        let doneCount = 0;
                        for (let i = 0; i < ownedCount; i++) {
                            let personalIndex = Number(i);
                            ((this.actorType === 0) ? managerInstance.getPlanterOwnedTree(this.actorIndex, personalIndex) :
                                managerInstance.getAskerOwnedTree(this.actorIndex, personalIndex))
                            .then(result => {
                                    let resultIndex = result[0].toNumber();
                                    if (result[1] === true) {
                                        managerInstance.getTree(resultIndex)
                                            .then(result => {

                                                this.ownedTrees.push({
                                                    treeId: resultIndex,
                                                    treeName: result,
                                                })
                                            })
                                            .catch(error => {
                                                this.$message.error("fail to load tree message");
                                                console.log(error);
                                            })
                                            .then(() => {
                                                if (++doneCount === ownedCount) {
                                                    this.loadChoose = false;
                                                }
                                            })
                                    } else {
                                        if (++doneCount === ownedCount) {
                                            this.loadChoose = false;
                                        }
                                    }
                                })
                                .catch(error => {
                                    this.$message.error("fail to load tree index");
                                    if (++doneCount === ownedCount) {
                                        this.loadChoose = false;
                                    }
                                })
                        }
                    })
                    .catch(error => {
                        this.$message.error("fail to load tree count");
                        this.loadChoose = false;
                    })
            },
            handleChooseChanged: function(treeNumber) {
                this.chosenTree = treeNumber;
            },
            finishOrder: function() {
                if (this.chosenTree === null) {
                    this.$message.warning("choose a tree to finish order first");
                    return false;
                }
                this.$message.info("dealing with order");
                managerInstance._finishOrder(this.chosenTree.treeId, this.finishOrderIndex, { from: this.currentActor })
                    .then(result => {
                        this.$message.success("finish order, gained " + String(this.gainedCoin) + "ETH");
                        this.chosenTree = null;
                        this.finishOrderDialogVisiable = false;
                        this.loadReceivedOrder();
                    })
                    .catch(error => {
                        this.$message.error("fail to finish order");
                    })
                return false;
            }


        },
        computed: {

        },
        mounted: function() {
            let vueInstance = this;

            if (typeof web3 !== 'undefined') {
                console.warn("Using web3 detected from external source like MetaMask")
                    // Use Mist/MetaMask's provider
                window.web3 = new Web3(web3.currentProvider);
            } else {
                console.warn("No web3 detected. Falling back to http://localhost:9545.");
                // fallback - use your fallback strategy
                window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
            }

            window.Manager.setProvider(web3.currentProvider);
            window.Manager.deployed().then(instance => { window.managerInstance = instance });

            // TODO: Check login when clicked
            this.loginDialogVisiable = true;
        },

    }

)