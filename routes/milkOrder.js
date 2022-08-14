const express = require('express');
const router = express.Router();
const query = require('../db/query');
const {placeNewOrder,cancelOrder} = require('../helperFunctions/order');
const config = require('../config');

router.get('/checkCapacity/:date', async(req, res) =>{
    try {
        // this function will add 100 litre quantity for the day if not present in collection
        let addMilkResponse = await query.addMilk();

        // send date in epoch format
        if(!req.params.date) return res.status(422).send({status: false, data:"date param not found"});
        
        let date = Number(req.params.date)
        let start = new Date(date);
        start.setHours(0,0,0,0);

        let end = new Date(date);
        end.setHours(23,59,59,999);

        // get milk left for the passed date
        let checkCapacityResponse = await query.checkCapacity({date: {"$gte": start, "$lt": end}});
        return res.status(200).send(checkCapacityResponse)
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status : false, data: error})
    }
});

router.post('/add', async (req, res) =>{
    try {
        if(!req.body.name) return res.status(422).send({status: false, data:"name field not found"});
        if(!req.body.customerId) return res.status(422).send({status: false, data:"customerId field not found"});
        if(!req.body.customerMobileNumber) return res.status(422).send({status: false, data:"customer Mobile Number field not found"});
        if(!req.body.adress) return res.status(422).send({status: false, data:"customer adress field not found"});
        if(!req.body.milkQuantity) return res.status(422).send({status: false, data:"milkQuantity field not found"});

        // this is helper function that will place new order
        let placeOrder = await placeNewOrder({milkQuantity:req.body.milkQuantity, customerName: req.body.name, customerId:req.body.customerId, customerMobileNumber:req.body.customerMobileNumber, adress:req.body.adress, orderStatus: config.order_status.placed})
        return res.status(200).send(placeOrder)
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status : false, data: error})
    }
});

router.put('/update/:id', async(req, res) =>{
    try {
        if(!req.params.id) return res.status(422).send({status: false, data:"id param not found"});
        
        let updatePayload = {};
        if(req.body.customerMobileNumber) {
            updatePayload.customerMobileNumber = req.body.customerMobileNumber 
        }

        if(req.body.name) {
            updatePayload.customerName = req.body.name 
        }

        if(req.body.milkQuantity) {
            updatePayload.milkQuantity = req.body.milkQuantity
        }

        if(req.body.adress) {
            updatePayload.adress = req.body.adress
        }

        // updating placed order by orderId(_id or ObjectID)
        let updatedMilkOrder = await query.updateOrder(req.params.id, updatePayload);
        return res.status(200).send(updatedMilkOrder)
        
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status : false, data: error})
    }
})

router.put('/updateStatus/:id', async(req, res) =>{
    try {
        if(!req.params.id) return res.status(422).send({status: false, data:"id param not found"});
        if(!req.body.status) return res.status(422).send({status: false, data:"status field not found"});
        
        let updatePayload = {};

        // checking the status field value is matching the config status numbers.
        if(!(Object.values(config.order_status).includes(req.body.status))){
            return res.status(422).send({status: false, data:`Send correct values as ${JSON.stringify(config.order_status)}`});
        }

        // checking if the orderid is exists and checking if the status is lesser than the current status then sending order status message
        let checkIfOrderExistsResult = await query.checkIfOrderExists(req.params.id);
        if(checkIfOrderExistsResult.status && checkIfOrderExistsResult.data && checkIfOrderExistsResult.data.orderStatus){
            if(req.body.status <= checkIfOrderExistsResult.data.orderStatus) {
                let key = Object.keys(config.order_status).find(key => config.order_status[key] == checkIfOrderExistsResult.data.orderStatus);
                // restricting the user to not revert the status
                return res.status(422).send({status: false, data:`Order already - ${key} cannot be reverted`});
            }
        } else {
            return res.status(200).send({ status : false, data: "Invalid OrderId"})
        }

        updatePayload.orderStatus = req.body.status;

        // updating order status by orderId(_id or ObjectID)
        let updatedMilkOrderStatus = await query.updateOrder(req.params.id, updatePayload);
        return res.status(200).send(updatedMilkOrderStatus)
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status : false, data: error})
    }
})

router.delete('/delete/:id', async(req, res) =>{
    try {
        if(!req.params.id) return res.status(422).send({status: false, data:"id param not found"});
        // Only Non delivered orders can be daleted/cancelled
        let deleteOrderResult = await cancelOrder(req.params.id)
        return res.status(200).send(deleteOrderResult)
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status : false, data: error})
    }
})

module.exports = router;