let type = '10off_40'
let coupon = {
    code: 'HJSLIU8',
    date: new Date().toLocaleString(),
}

async function addCoupon(type, coupon){
    await fetch('http://localhost:3000/add-coupon/'+type, {
        method: 'POST', 
        body: JSON.stringify(coupon),
        headers: {
            'Content-Type': 'application/json'
        },
    })
}

async function getCoupon(type){
    await fetch('http://localhost:3000/get-coupon/'+type).then(async response => {
        let data = await response.json();
        console.log(data)
    })
}

async function getCoupons(){
    await fetch('http://localhost:3000/get-coupons').then(async response => {
        let data = await response.json();
        console.log(data)
    })
}