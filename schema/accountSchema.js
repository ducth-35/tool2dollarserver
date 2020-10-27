let mongoose = require('mongoose')
let accountSchema = new mongoose.Schema({
    cookies:{
        type:String,
        required:true
    },
    userAgent:{
        type:String,
        required:true
    },
})
module.exports = accountSchema