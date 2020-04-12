const express = require("express");
const path = require('path');
const puppeteer = require('puppeteer');
var bodyParser = require('body-parser');

let page = null;
(async () => {
    const browser = await puppeteer.launch({ headless: true });
    return await browser.newPage();
})().then( (p) => {
    page = p;
}).catch( (err) => {
    page = null;
});

var ex = express();
ex.use(bodyParser.json());
ex.use(bodyParser.urlencoded({ extended: true })); 

ex.get("/getQRCode",  async (req, res) => {

    await page.goto("https://web.whatsapp.com/", { waitUntil: 'networkidle2' });
     await page.waitForSelector('.landing-main');
    const qrCode = page.evaluate( () => {
        const divQrCode = document.getElementsByClassName("landing-main")[0];
        console.log(divQrCode);
        return divQrCode;
    });
    
    console.log(qrCode);
    
    res.send(qrCode);
});

ex.post("/sendMessage", async (req, res) => {
    const phone = req.body.phone;
    const message = req.body.message;

    page.evaluate(() => {
        let camposTexto = document.getElementsByClassName('_2S1VP copyable-text selectable-text');
        if( typeof camposTexto != "undefined" && (camposTexto.length > 0) ){
            if(camposTexto[1]){
                camposTexto[1].textContent = '';
            }
        }
    });

    await page.goto("https://web.whatsapp.com/send?phone="+phone+"&text="+message, { waitUntil: 'networkidle2' });    
    await page.waitForSelector('._35EW6');
    const data = page.evaluate( () => {
        const btnSend = document.getElementsByClassName("_35EW6")[0];
        if(btnSend){
            btnSend.click();
        }
    });
    res.send({ status : true, message : "Mensagem enviada com sucesso!" });
});

ex.listen(3400);
// await browser.close()

// wss://web.whatsapp.com/ws