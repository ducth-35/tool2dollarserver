let express = require('express')
let app = express()
let hbs = require('hbs')
const path = require('path')
const bodyParser = require('body-parser');
let mongoose = require('mongoose')
mongoose.connect('mongodb+srv://admin:phongdepzai123@cluster0-g0afi.mongodb.net/assignment', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(function () {
    console.log("Connected")
})
//ccv Schema
let ccvSchema = require('./schema/ccvschema')
let Ccv = mongoose.model('ccv', ccvSchema, 'ccv')
let keycodeschema = require('./schema/keycodeschema')
let KeyCode = mongoose.model('keycode', keycodeschema, 'keycode')
//Express init
app.set('views', path.join(__dirname, "views"))
app.set('view engine', 'hbs')
app.use('/assets', express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(bodyParser.raw())
app.post('/addCcv', async (req, res) => {
    let ccv = new Ccv({
        keycode : req.body.keycode,
        ccv:req.body.ccv
    })
    try {
        let stt = await ccv.save()
        if (stt != null) {
            res.send(200,"Thêm thành công !")
        }
    } catch (e) {
        res.send(500,'Có lỗi xảy ra' + e)
    }
})
app.post('/login', async (req, res) => {
    let isExisted = await KeyCode.find({keycode: req.body.keycode})
    if(isExisted.length!=0){
        if(isExisted[0].isLoggedIn){
            res.status(501).send("Có máy khác đang đăng nhập")
        }
        else{
            res.send(200,"Key hợp lệ")
            let stt = await KeyCode.findOneAndUpdate({"keycode": req.body.keycode},{
                isLoggedIn:true
            })

        }

    }
    else{
        res.send(404,"Không tìm thấy key")
    }

})
app.post('/logout', async (req, res) => {
    let isExisted = await KeyCode.find({keycode: req.body.keycode})
    if(isExisted[0].isLoggedIn){
        let stt = await KeyCode.findOneAndUpdate({"keycode": req.body.keycode},{
            isLoggedIn:false
        })
        res.send(200,"Thành công !")
    }
    else{
        res.send(200,"Thành công !")
    }
})
app.listen(process.env.PORT||9000)