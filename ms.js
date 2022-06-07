const { Builder, By, Key, until, WebElement, Capabilities, WebDriver } = require('selenium-webdriver');
require('chromedriver');
const chrome = require("selenium-webdriver/chrome");
const fs=require('fs')
// const sleep = require('./views/sleep');
var options = new chrome.Options();
// options.addArguments("--headless");
// options.addArguments("dissable-gpu")
options.addArguments("--disable-logging");
options.addArguments("--log-level=3");


(async ()=>{
    //read cookie file
    let cookieString=fs.readFileSync('cookies.json','utf8')
    let cookies=await JSON.parse(cookieString)

    //read bot data
    let botData=fs.readFileSync('settings.json','utf8')
    let secondMessage=await JSON.parse(botData).secondMessage
    let delay=await JSON.parse(botData).secondMessageDelay

    let alreadyMessaged=new Array()
    let driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    await driver.get('https://studybay.app/home/myorders?type=0') 
    for(let cook of cookies){
        await driver.manage().addCookie(cook)
    }

    await driver.get('https://studybay.app/home/myorders?type=0') 

    let orders=null
    let odaID=null
    while(1>0){
        try{
            await driver.wait(until.elementLocated(By.css("HAKUNA")),delay*1000)
        }catch(err){
            console.log(`waited ${delay} secs to send second message`)
        }
    
        try{
            orders=await driver.wait(until.elementsLocated(By.xpath("//div[@class='countMessages orders__item_bottom__messages']")),30000)

        }catch(err){
            console.log('err 201',err)
        }

        for(let oda of orders){
            //get oda id 
            try{
                odaID=await oda.getAttribute('data-id')
            }catch(err){
                console.log('err 201-b',err)
                break
            }
            
            if(alreadyMessaged==null){
                alreadyMessaged=["none"]
            }
            //if already messaged ,continue to next    
            if(alreadyMessaged.includes(odaID)){
                // console.log('ALREADY MESSAGED')
                continue
            }

            // open the order page
            await driver.get(`https://studybay.app/order/getoneorder/${odaID}/`)

            //check if message was already sent
            try{
                await driver.wait(until.elementLocated(By.xpath("//div[@class='im__content_message-text '] ")),5000)
                // console.log('KUNA MESSAGE ALREADY')
                //add to messaged array
                alreadyMessaged.push(odaID)

                //redirect to 'chat auction'
                await driver.get("https://studybay.app/home/myorders?type=0")
                break

            }catch(err){
                // console.log('WRITING MESSAGE...................')
                try{
                    await driver.wait(until.elementLocated(By.id(`comment`)),15000).sendKeys(secondMessage)
                    let sendBtn=await driver.wait(until.elementLocated(By.id(`control_submitter`)),5000)
                    await driver.executeScript('arguments[0].click()',sendBtn)
                    alreadyMessaged.push(odaID)
                    await driver.get("https://studybay.app/home/myorders?type=0")
                }catch(err){
                    console.log('err 202',err)
                }
               
            }
            
            
            break
        }

        await driver.get("https://studybay.app/home/myorders?type=0")
        // sleep.sleep(5)

        
        
        
       
    }
    
})()


