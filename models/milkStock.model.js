const mongoose = require('mongoose');
const milkStockSchema = new mongoose.Schema({
    quantity : {
        type: Number,
        default: 100
    },
    date : {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("MilkStock", milkStockSchema);