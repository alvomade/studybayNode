const { Builder, By, Key, until, WebElement, Capabilities, WebDriver } = require('selenium-webdriver');
require('chromedriver');
var chrome = require("selenium-webdriver/chrome");
const axios = require('axios')
const fs = require('fs')
const rw = require('./readWrite')
const encDec = require('./encDec')
const bidder=require('./bidder')

//server area
const express = require('express')
const app = express()
const body_parser = require('body-parser')
app.set('view engine', 'ejs')

app.use(body_parser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    let raw = fs.readFileSync('settings.json')
    let data = JSON.parse(raw)
    res.render('index', { data: data })
})

var server = app.listen(3000, () => "server is running");
//server area end

var options = new chrome.Options();
// options.addArguments("--headless");
// options.addArguments("dissable-gpu")
options.addArguments("--disable-logging");
options.addArguments("--log-level=3");




function settings() {
    return new Promise((resolve, reject) => {
        let raw = fs.readFileSync('settings.json')
        let data = JSON.parse(raw)

        let driver = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        // if(data.botID){
        driver.get("http://localhost:3000");

        app.post('/', (req, res) => {

            data.email = req.body.email
            data.password = req.body.password
            data.unwantedSubjects = req.body.unwantedSubjects.trim().split(",")
            data.priceLevel = req.body.priceLevel
            data.refreshRate = req.body.refreshRate
            if (req.body.bidUrgent === "on") {
                data.bidUrgent = true
            } else {
                data.bidUrgent = false
            }

            fs.writeFileSync('settings.json', JSON.stringify(data))
            res.end()
            driver.quit()
            resolve(data)


        })





    })
}


function validateSub(botID) {
    return new Promise((resolve, reject) => {
        axios.get(`https://turbo.clink.co.ke/sb/${botID}`).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err)
        })
    })

}



settings().then((currentSettings) => {
    server.close()
    rw.getBotData().then((botData) => {
        //after registering bot or getting botId
        console.log('BOT ID...: ', botData.botID)
        validateSub(currentSettings.botID || botData.botID)
            .then((result) => {
                if (!result.data[0].active) {
                    console.log('subscription expired');
                } else if (result.data[0].active) {
                    console.log('subscription is ACTIVE ,exp on: ', result.data[0].end);

                    //validate one subscription one user
                    if (encDec.enc(currentSettings.email) === result.data[0].user || result.data[0].user == null) {
                        if(result.data[0].user==null){
                            //update user field in db
                            axios.put(`https://turbo.clink.co.ke/sb/${botData.botID}/${botData.email}`).then((data)=>{
                                bidder.runBot(currentSettings)
                            })
                        }else{
                            bidder.runBot(currentSettings)
                        }
                        
                        
                    } else {
                        console.log('subscription belongs to another user/wrong email,contact admin for help')
                    }

                }
            })
    })
})






