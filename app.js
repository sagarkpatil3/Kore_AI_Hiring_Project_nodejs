const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./db/mongo');
const cors = require('cors');
const path = require('path');
global.__root   = __dirname + '/';

app.use(cors());
app.options('*', cors());
app.use(express.static(path.join(__dirname,'public')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const milkOrder = require(__root + './routes/milkOrder');
app.use('/milkOrder', milkOrder);

const port = '8003';
app.listen(port, ()=>{
    console.log(`Server is running on port: ${port}`)
})