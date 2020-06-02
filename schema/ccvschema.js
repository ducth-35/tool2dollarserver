let mongoose = require('mongoose')
let ccvschema = new mongoose.Schema({
    keycode:{
        type:String,
        required:true
    },
    ccv:{
        type:String,
        required:true
    },
})
module.exports = ccvschema