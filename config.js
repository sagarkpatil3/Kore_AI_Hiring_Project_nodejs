// connected to mongoDB Cluster if required replace with local connection
const db = {
    MONGOOSE_URL : 'mongodb+srv://sagarkp3:Hackathon123@cluster0.tnajmm0.mongodb.net/?retryWrites=true&w=majority',
    MONGOOSE_DBNAME : 'Hackthon'
}

const order_status  = {
    'placed': 1,
    'packed': 2,
    'dispatched': 3,
    'delivered': 4,
    'deleted': 5
}

module.exports = {
    db_config: db,
    order_status: order_status
}
