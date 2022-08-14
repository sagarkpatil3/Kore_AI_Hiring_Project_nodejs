const milkOrders = require('../models/milkOrder.model');
const milkStock = require('../models/milkStock.model');

let queries = {
    // placing new order
    placeOrder : function(orderPayload){
        return new Promise(function(resolve, reject){
            let placeNewOrder = new milkOrders(orderPayload);
            placeNewOrder.save(function(error, result){
                if(error) return reject({ status: false, data: error});
                return resolve({status: true, data: result})
            })
        })
    },

    // updating placed order by order id
    updateOrder: function(orderId, updatePayload) {
        return new Promise((resolve, reject) =>{
            milkOrders.findByIdAndUpdate({_id: orderId},updatePayload,{new: true},function(error, result){
                if(error) return reject({ status: false, data: error});
                return resolve({status: true, data: result})
            })
        })
    },

    // checking milk capacity for the particular date
    checkCapacity: function(payload) {
        return new Promise((resolve, reject) =>{
            milkStock.find(payload, function(error, result){
                if(error) return reject({ status: false, data: error});
                return resolve({status: true, data: result})
            })
        })
    },

    // insert 100 litre milk for the current day, dafault is already defined in module 
    addMilk: function(){
        return new Promise(function(resolve, reject){
            let start = new Date();
            start.setHours(0,0,0,0);

            let end = new Date();
            end.setHours(23,59,59,999);
            milkStock.findOneAndUpdate({date: {"$gte": start, "$lt": end}}, {}, {upsert: true}, function(error, result){
                if(error) return reject({ status: false, data: error});
                return resolve({status: true, data: result})
            });
        })
    },

    // checking order exists by order _id
    checkIfOrderExists: function(orderId){
        return new Promise(function(resolve, reject) {
            milkOrders.findById({_id: orderId}, function(error, result){
                if(error) return reject({ status: false, data: error});
                return resolve({status: true, data: result})
            })
        })
    }

}

module.exports = queries