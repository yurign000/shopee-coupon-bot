const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs');

const audio_buffer = fs.readFileSync('alarm.mp3');

class Coupon{
    constructor(code, date){
        this.code = code;
        this.date = date;
    }
}
var coupons = {
    '5off_10':   {code: '', data: ''},
    '10off_40':  {code: '', data: ''},
    '20off_80':  {code: '', data: ''},
    '20off_70':  {code: '', data: ''},
    '50off_150': {code: '', data: ''},
    '25%off':    {code: '', data: ''},
}

app.use(express.json())
app.use(cors())

app.get('/get-coupon/:type', (req, res) => {
    res.status(200).json({'Coupon': coupons[req.params.type]});
})
app.get('/get-coupons', (req, res) => {
    res.status(200).json(coupons);
})
app.get('/get-audio', (req,res) => {
    res.setHeader('Content-Type', "audio.mpeg")
    res.status(200).send(audio_buffer)
    // res.status(200).send({'audio': audio_buffer})
})

app.post('/add-coupon/:type', (req, res) => {
    const body = req.body;

    coupons[req.params.type] = new Coupon(body.code, body.date);

    console.log(body, req.params);
    res.status(200).json({'Coupon added:': req.params.type});
})

app.listen(3000, () => {
    console.clear()
    console.log('Server is running...')
});