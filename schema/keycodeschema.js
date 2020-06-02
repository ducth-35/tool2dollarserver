let mongoose = require('mongoose')
let keycodeschema = new mongoose.Schema({
    keycode:{
        type:String,
        required:true
    },
    isLoggedIn:{
        type:Boolean,
        required:false,
        default:false
    },
})
module.exports = keycodeschema