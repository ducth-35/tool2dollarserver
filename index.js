let express = require('express')
var stringify = require('csv-stringify');
var fs = require('fs');
var mongoose_csv = require('mongoose-csv');
let app = express()
const converter = require('json-2-csv');
let hbs = require('hbs')
const path = require('path')
const bodyParser = require('body-parser');
let mongoose = require('mongoose')
const googleTrends = require('google-trends-api');
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
let accountSchema = require('./schema/accountSchema')
let Account = mongoose.model('account',accountSchema,'account')

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
function transform(doc){
    // Return an object with all fields you need in the CSV
    // For example ...
    return {
        cookies: doc.cookies,
        userAgent: doc.userAgent,
        date: doc.date
    };
}
app.get('/getCSV', async (req, res) => {
    let cursor = await Account.find().lean().sort([['_id', -1]])

    converter.json2csv(cursor, (err, csv) => {
        if (err) {
            throw err;
        }


        res.attachment('filename.csv');
        res.status(200).send(csv);
    });
})
app.get('/accountView', async (req, res) => {
    let account = await Account.find({}).sort([["_id", -1]])
    console.log(typeof account)
    res.render('account_view',{results: account})
})
app.get('/', async (req, res) => {
    googleTrends.dailyTrends({
    trendDate: new Date(),
    geo: req.query.countryCode,
}, function(err, results) {
    if (err) {
        console.log(err)
        res.send(err)
    }else{
        let strVals = results.match(/(?<=":")([^:]+?)(?="(?=,|}|]))/g) //[ '“Fuel” Natural Fish Food - "Fuel" Natural Fish Food','0.00','Aqua Design Innovations' ]

        strVals.forEach(strVal => {
            // we replace all quotes with literal quotes
            let newVal = strVal.replace(/("|“|”)/g,'\\"');
            // then replace the new value back to original string
            results = results.replace(strVal,newVal);
        })

        console.log(results); //{"line_items":[{"id":853139563, "taxable":true, "title":"\"Fuel\" Natural Fish Food - \"Fuel\" Natural Fish Food", "total_discount":"0.00", "vendor":"Aqua Design Innovations"}]}

        let json = JSON.parse(results);

        console.log(json);
        res.send(json)
    }
});
})
app.post('/addAccount', async (req, res) => {
    let account = new Account({
        cookies: req.body.cookies,
        userAgent:req.body.userAgent,
        date:new Date()
    })
    try {
        let stt = await account.save()
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