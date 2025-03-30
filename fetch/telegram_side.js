'use strict';

let type = '10off_40'
let coupon = {
    code: 'HJSLIU8',
    date: new Date().toLocaleString(),
}

async function addCoupon(type, coupon){
    const request = await GM.xmlHttpRequest({
        url: 'http://localhost:3000/add-coupon/'+type,
        method: 'POST',
        data: JSON.stringify(coupon),
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch(e => console.error(e));

    console.log(request.responseText);
}
addCoupon(type, coupon)