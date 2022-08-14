
const mongoose = require('mongoose');
const dbConfig = require('../config').db_config ;

mongoose.connection.on('connected', ()=>{
    console.log('Connection to Mongo established.');
});

mongoose.connect(dbConfig.MONGOOSE_URL,{dbName: dbConfig.MONGOOSE_DBNAME}, function(err, client){
    if (err) {
        console.log("mongo error", err);
        return;
    }
})