const mongoose = require('mongoose');
const milkOrders = require('../models/milkOrder.model');
const milkStock = require('../models/milkStock.model');
const config = require('../config');


async function placeNewOrder(orderPayload){
    const session = await milkOrders.startSession();
    const transactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
    };

    let start = new Date();
    start.setHours(0,0,0,0);

    let end = new Date();
    end.setHours(23,59,59,999);

    // checking if the milk stock is available or not
    let checkStock = await milkStock.findOne({date: {"$gte": start, "$lt": end}}, {quantity: 1, _id:0});
    if(!checkStock.quantity || checkStock.quantity <  orderPayload.milkQuantity){
        return ({status:true, data:`Only ${checkStock.quantity} Litre Milk left, Please change the quantity and reorder`});
    }

    let orderResult;
    // using Transaction query inserting new order and decreasing the milk stock from the collection for the day
    try {
        const transactionResult = await session.withTransaction(async()=>{
            const newOrder = new milkOrders(orderPayload);
            orderResult = await newOrder.save({session});

            const updateMilkStock = await milkStock.findOneAndUpdate(
                {date: {"$gte": start, "$lt": end}},
                { $inc: {'quantity': -(orderPayload.milkQuantity)}},
                {new: true, session: session}
            );
        }, transactionOptions)

        if(transactionResult){
            return ({status:true, data:orderResult});
        } else {
            console.log(transactionResult)
            return ({status:false, data:"Error While placing order"});
        }
    } catch (error) {
        console.log("The transaction was aborted due to an unexpected error: " + error);
        return ({status:false, data:error}); 
    } finally {
        await session.endSession();
    }
}

async function cancelOrder(orderId){
    const session = await milkOrders.startSession();
    const transactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
    };

    let start = new Date();
    start.setHours(0,0,0,0);

    let end = new Date();
    end.setHours(23,59,59,999);
    
    // Checking if orderId exists
    let orderResult = await milkOrders.findById({_id:orderId},{milkQuantity: 1, orderStatus: 1});
    if(!orderResult || !orderResult["_id"]){
        return ({status:false, data:"Send Valid OrderId"});
    } else if(orderResult["orderStatus"] == 4 ){
        return ({status:false, data:"Order is already delivered cannot be deleted"});
    }

    let canceledOrderResult;
    // using Transaction query Updating Placed order and reverting the milk stock from the collection for the day
    try {
        const transactionResult = await session.withTransaction(async()=>{
            
            canceledOrderResult = await milkOrders.findOneAndUpdate({_id:orderId},
                {orderStatus: config.order_status.deleted},
                {new: true, session: session});
            const updateMilkStock = await milkStock.findOneAndUpdate(
                {date: {"$gte": start, "$lt": end}},
                {$inc: {'quantity': orderResult.milkQuantity}},
                {new: true, session: session}
            );
        }, transactionOptions)

        if(transactionResult){
            return ({status:true, data: canceledOrderResult});
        } else {
            console.log(transactionResult)
            return ({status:false, data:"Error While deleting order"});
        }
    } catch (error) {
        console.log("The transaction was aborted due to an unexpected error: " + error);
        return ({status:false, data:error}); 
    } finally{
        await session.endSession();
    }
}

module.exports = {placeNewOrder, cancelOrder}