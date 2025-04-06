// ==UserScript==
// @name         Pegar cupons
// @namespace    http://tampermonkey.net/
// @version      2025-03-30
// @description  try to take over the world!
// @author       You
// @match        https://web.telegram.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=telegram.org
// @grant GM_setValue
// @grant GM_getValue
// @grant GM.setValue
// @grant GM.getValue
// @grant GM_setClipboard
// @grant GM_xmlhttpRequest
// @connect *
// ==/UserScript==

(function() {
    'use strict'

    let saved_coupons = [];
    let wanted_coupons = ['5off_10','5off_20','10off_40','20off_60','20off_70','20off_80','50off_150'];

    let interval = 0;
    let is_first_search = true;

    async function addCoupon(type, code, date) {
        const request = await GM.xmlHttpRequest({
            url: 'http://localhost:3000/add-coupon/' + type,
            method: 'POST',
            data: JSON.stringify({code: code, date: date}),
            headers: {
                'Content-Type': 'application/json'
            },
        }).catch(e => console.error(e));
    }

    async function playAudio(type = '', code = '', date = '') {
        const request = await GM.xmlHttpRequest({
            url: 'http://localhost:3000/get-audio/',
            method: 'GET',
            responseType: 'blob',
            onload: (response) => {
                const url = URL.createObjectURL(response.response)
                var audio = new Audio(url);

                audio.play();
            }
        })
        .catch(e => console.error(e));
    }

    function createDraggableDiv(){
        let resizer_model = `
            <div id="resizer-expand-area">
                <div id="resizer-area">
                    <div id="resizer-interact">
                        <button>Iniciar Bot</button>
                    </div>
                </div>
            </div>

            <style>
                #resizer-expand-area{
                    position: fixed;
                    top: 0;
                    width: min-content;
                    pointer-events: none;
                    z-index: 999;
                }
                #resizer-area{
                    filter: sepia(2) hue-rotate(290deg);
                    width: 130px;
                    height: 100px;
                    overflow: hidden;
                    resize: both;
                    pointer-events: none;
                    user-select: none;
                }
                #resizer-area:after{
                    content:"";
                    position: absolute;
                    bottom: 0;
                    right:0;
                    display:block;
                    width:15px;
                    height:15px;
                    cursor: grab;
                    pointer-events: all;
                    background-color: #777;
                    border-right: 3px solid #fff;
                    border-bottom: 3px solid #fff;
                    z-index: 10;
                }
                #resizer-area::-webkit-resizer{
                }
                #resizer-interact{
                    position: absolute;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding-top: 5px;
                    background-color: #aaa;
                    z-index: 1;
                    right: 0;
                    bottom: 15px;
                    height: 40px;
                    width: 130px;
                    border: solid 3px #fff;
                    pointer-events: all;
                    border-bottom: none;
                }
                #resizer-interact::before{
                    content: '';
                    position: absolute;
                    background-color: #888;
                    user-select: none;
                    pointer-events: none;
                    border: solid 3px #fff;
                    border-top: none;
                    width: 130px;
                    height: 15px;
                    bottom: -15px;
                    left: -3px;
                    cursor: pointer;
                }
                #resizer-interact button{
                    transform: translateY(3.25px);
                    background-color: #fff;
                    border:solid 4px #777;
                    font-weight: 900;
                    color: #444;
                    cursor: pointer;
                    transition: 0.1s;
                    outline: none;
                }
                #resizer-interact button:hover{
                    color: #666
                }
            </style>
        `
        document.body.innerHTML += resizer_model

        let button = document.querySelector('#resizer-interact button')
        button.onclick = ({target}) => {
            let resizer_expand_area = document.querySelector("#resizer-expand-area");
            updatePosts();
            resizer_expand_area.remove()
        }
    }
    createDraggableDiv()

    function updatePosts(){
        interval = setInterval(() => {
            try {
                let posts = document.querySelectorAll('.message-list-item');
                let scroll_list = document.querySelector('.MessageList.custom-scroll');

                    console.log(posts.length)
                if (posts.length > 20) {
                    let posts_to_delete = posts.length - 20;

                    // for (let i = 0; i < posts_to_delete; i++) {
                    //     // posts[i].remove();
                    // }
                    findCoupon(posts)

                    is_first_search = false;
                }

                if (is_first_search) findCoupon(posts);

                scroll_list.scrollBy(0, scroll_list.scrollHeight)

            } catch (e) {
                console.error("Erro: ", e);
            }

        }, 3000);
    }

    function findCoupon(posts) {
        posts.forEach(e => {
            let content = e.lastChild.firstChild.childNodes[1].lastChild?.innerText || "";
            let post_text;
            let coupons = [
                // { code: "", date: "", type: "" }
                //...
            ];

            if (content.includes("DESCONTO NA SHOPEE")) {
                post_text = content.split('\n');

                if (post_text && post_text.length >= 1) {
                    post_text = getCorrectPost(post_text);

                    if(post_text){
                        formatCoupons(post_text, coupons);
                        tryToPostCoupons(coupons);
                    }
                }
            }

        })
    }

    function getCorrectPost(post_text){
        let is_valid_format = false;

        for (let i = 0; i < post_text.length; i++) {
            if (post_text[i].includes("PRODUTOS SELECIONADOS")) {
                cutPostLines(post_text, i + 1);
                i = 0;
                is_valid_format = true;
            }
            else if (post_text[i].includes("O resgate desse cupom")) {
                cutPostLines(post_text, i + 1);
                break;
            }
        }

        if(is_valid_format) return getFilteredPost(post_text)
        else return false;
    }

    function cutPostLines(lines, cut_to) {
        while (cut_to--) lines.shift();
        lines.reverse();
    }

    function getFilteredPost(post_text){
        post_text = post_text.filter(line => line != "");
        post_text = post_text.map(line => [line.split(":")] || [line.split("-")])
        post_text = post_text.map(line => {
            if (line[0].length > 1) {
                return [line[0][0].match(/\d+/g), line[0][1].trim()];
            }
            else if (line[0][0].trim().split(' ').length > 1) {
                return [line[0][0].match(/\d+/g)]
            }
            return line[0][0].trim();
        })

        return post_text;
    }

    function formatCoupons(post_text, coupons){
        if(!(post_text[0] instanceof Array) || !(post_text[0] instanceof Array)){
            if(!(post_text[1] instanceof Array)) post_text.reverse();

            coupons.push({
                type: `${post_text[1][0][0]}off_${post_text[1][0][1]}`,
                code: post_text[0],
                date: new Date().toLocaleString(),
            })
        }
        else{
            post_text.forEach((line, i) => {
                coupons.push({
                    type: `${line[0][0]}off_${line[0][1]}`,
                    code: line[1],
                    date: new Date().toLocaleString(),
                })
            })
        }

        return post_text;
    }

    function tryToPostCoupons(coupons){
        let is_new_coupon = false;

        coupons.forEach(coupon => {
            let format = JSON.stringify({type: coupon.type, code: coupon.code});

            if(!(JSON.stringify(saved_coupons).includes(format))){
                if(wanted_coupons.includes(coupon.type)){
                    saved_coupons.push({type: coupon.type, code: coupon.code})
                    addCoupon(coupon.type, coupon.code, coupon.date)
                    is_new_coupon = true;
                }
            }
        })

        if(is_new_coupon){
            playAudio();
            console.log(coupons)
        }
    }

})();