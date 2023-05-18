const dotenv = require("dotenv").config();
const mongoose = require("mongoose");

const connect = () => {
    
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true })
    .then(()=>{
        console.log('Database connected');
    })
    .catch((error) => {
        console.error("database error");
    });
}

module.exports = connect;