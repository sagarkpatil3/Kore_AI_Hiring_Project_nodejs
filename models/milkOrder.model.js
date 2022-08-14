const mongoose = require('mongoose');
// const ObjectID = mongoose.Types.ObjectId;

const milkOrderSchema = new mongoose.Schema({
    customerName : {
        type: String,
        default: ""
    },
    customerId : {
        type: Number
    },
    customerMobileNumber :{
        type: Number,
        validate: {
            validator: function(v) {
                return /\d{10}/.test(v);
            },
            message: '{VALUE} is not a valid 10 digit number!'
        }
    },
    adress : {
        type: String
    },
    milkQuantity : {
        type: Number
    },
    orderStatus : {
        type: String
    },
    orderDateTime : {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("MilkOrders", milkOrderSchema);