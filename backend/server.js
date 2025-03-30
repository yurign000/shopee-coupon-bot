var express = require('express');
var cors = require('cors')
var app = express();

class Coupon{
    constructor(code, date){
        this.code = code;
        this.date = date;
    }
}
var coupons = {
    '5off_10':   '',
    '10off_40':  '',
    '20off_80':  '',
    '20off_70':  '',
    '50off_150': '',
    '25%off':    '',
}

app.use(express.json())
app.use(cors())

app.get('/get-coupon/:type', (req, res) => {
    res.status(200).json({'Coupon': coupons[req.params.type]});
})
app.get('/get-coupons', (req, res) => {
    res.status(200).json(coupons);
})

app.post('/add-coupon/:type', (req, res) => {
    const body = req.body;

    coupons[req.params.type] = new Coupon(body.code, body.date);

    res.status(200).json({'Coupon added:': req.params.type});
})

app.listen(3000, () => console.log('Server Started'));