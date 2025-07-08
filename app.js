require('dotenv').config();
const express = require('express');
const path = require('path');
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
var app = express();
app.use(express.urlencoded({ extended: false }));

var tax = {
    "Ab": 0.05,
    "Bc": 0.05,
    "Man": 0.05,
    "Nb": 0.15,
    "Nl": 0.15,
    "Nt": 0.05,
    "Ns": 0.15,
    "Nu": 0.05,
    "On": 0.13,
    "Qb": 0.05,
    "Pel": 0.15,
    "Sas": 0.05,
    "Yk": 0.05
};
var shipping = {
    "1 Day" : 3,
    "2 Days": 2,
    "3 Days": 1
};

app.set('views', path.join(__dirname, 'views'))
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')

const Shop = mongoose.model('shop', {
    name: String,
    province: String,
    address: String,
    city: String,
    phoneNumber: String,
    email: String,
    postalCode:String,
    footballShoe: Number,
    footballSocks: Number,
    footballGloves: Number,
    total: Number,
    shipping: Number,
    tax: Number,
    finalTotal: Number

});
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Atlas connected"))
.catch(err => console.error("❌ Connection error:", err));

var phoneReg = /^\d{10}$/;
var emailReg = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.com$/;

app.get('/', (req, res) => {
    res.render('main');
});

app.get('/ret', (req, res) => {

    Shop.find({}).then((data) => {
        res.render('view', { datas: data });

    }).catch((err) => {
        console.log(err);
    });


});

app.post('/', [
    check('name', 'Name should not be empty').notEmpty(),
    check('address', 'Address should not be empty').notEmpty(),
    check('city', 'City should not be empty').notEmpty(),
    check('province', 'Province should not be empty').notEmpty(),
    check('phoneNumber', 'Phone Number Invalid').matches(phoneReg),
    check('email', 'Email is Invalid').matches(emailReg),
    check('shipping','Delivery time should not be empty').notEmpty(),
    check('postalCode', 'Postal Code is Empty').notEmpty()

], (req, res) => {


    var errors = validationResult(req);
    // console.log(errors)
    var price1 = 0;
    if (!isNaN(parseInt(req.body.footballShoe))) {
        price1 = parseInt(req.body.footballShoe) * 15;
    }
    var price2 = 0;
    if (!isNaN(parseInt(req.body.footballSocks))) {
        price2 = parseInt(req.body.footballSocks) * 5;
    }
    var price3 = 0;
    if (!isNaN(parseInt(req.body.footballGloves))) {
        price3 = parseInt(req.body.footballGloves) * 10;
    }
    var total = price1 + price2 + price3;
    if (!errors.isEmpty()) {
        if (total < 10) {
            res.render('main', { errors: errors.array(), errorMessage: " Please ensure to buy above 10$" })
        } else {
            res.render('main', { errors: errors.array() })
        }
        // console.log(req.body)

    } else {
        if (total > 10) {
            var finalTax = total * tax[req.body.province];
            var nShop = new Shop({
                name: req.body.name,
                province: req.body.province,
                address: req.body.address,
                city: req.body.city,
                phoneNumber: req.body.phoneNumber,
                email: req.body.email,
                postalCode:req.body.postalCode,
                footballShoe: req.body.footballShoe,
                footballSocks: req.body.footballSocks,
                footballGloves: req.body.footballGloves,
                total: total,
                shipping:shipping[req.body.shipping],
                tax: finalTax,
                finalTotal: (total + finalTax + shipping[req.body.shipping])
            })
            nShop.save().then((data) => {
                 res.render('main', data);
            }).catch((err) => {
                console.log(err)
            })
            
        } else {
            res.render('main', { errorMessage: " Please ensure to buy above 10$" });
        }

        // console.log(total)
    }


});

app.get('/delete/:ids&:type',(req,res)=>{

    Shop.findOneAndDelete({_id:req.params.ids}).then((data)=>{
        if(data != null){
            res.redirect('/ret');
        }else{
            console.log('Could not Find Record');
    
        }

    }).catch((err)=>{
        console.log(err);
    })
});

app.listen(8080);
console.log('Started Listening')