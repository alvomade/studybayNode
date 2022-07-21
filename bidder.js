const { Builder, By, Key, until, WebElement, Capabilities, WebDriver } = require('selenium-webdriver');
require('chromedriver');
const chrome = require("selenium-webdriver/chrome");
const {execFile}=require('child_process')
const readWrite=require('./readWrite')
let contentJSON = [];
let login=false
var options = new chrome.Options();
// options.addArguments("--headless");
// options.addArguments("dissable-gpu")
options.addArguments("--disable-logging");
options.addArguments("--log-level=3");
// options.

// const pref = new Map();
// pref.set('profile.default_content_setting_values.notifications', 2)



exports.runBot=async (botData)=> {
    var locators={};
    //getting the locators
    readWrite.getLocators().then((data)=>{
        locators=data
        console.log(locators)

    }).catch(err=>console.log(err))

    console.log(JSON.stringify(botData))
    const unwantedSubjects = new Set(botData.unwantedSubjects)
    let driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    // Navigate to Url
    await driver.get('https://studybay.app');
    console.log(`THERE ARE COOKIES${contentJSON.length}`)
    if (contentJSON.length >= 1) {
        console.log(`THERE ARE COOKIES${contentJSON.length}`)
        for (var i = 0; i < contentJSON.length; i++) {
            await driver.manage().addCookie(contentJSON[i])
        }
    }


    if (contentJSON.length <= 0) {
        try {
            // Enter text "cheese" and perform keyboard action "Enter"
            await driver.wait(until.elementLocated(By.name('email')), 10000).sendKeys(botData.email);

            await driver.wait(until.elementLocated(By.name('password')), 10000).sendKeys(botData.password);

            await driver.wait(until.elementLocated(By.xpath('//button')), 5000).click();

            await driver.wait(until.titleIs('Studybay'), 50000);
            login=true
        } catch (err) {
            console.log('ERROR LOGIN IN..TRY AGAIN',err)
            login=false

        }
    }


    await driver.get("https://studybay.app/order/search");

    //save cookies if there  is none 
    if (contentJSON.length <= 0) {
        driver.manage().getCookies().then(function (cookiez) {
            contentJSON = cookiez

            //SAVE COOKIES TO FILE FOR MESSENGER BOT
            readWrite.writeCookieFile(cookiez)

            if(login){
            console.log('SUCCESSFUL LOGIN....BIDDING...')
                if(botData.sendSecondMessage){
                    execFile('./messo.exe',(err)=>{
                        
                    })
                }
            } 

        });
    }

    let orders = null;
    let bidded=new Set()
    let refreshs = 0
    let orderID=null
    let skip_bidded_orders=true
    while (1 > 0) {

        //

        if (refreshs >= 100) {
            console.log('CLEARING MEMORY,PLEASE WAIT...: ', refreshs)
            await driver.close();
            driver = new Builder()
                .forBrowser('chrome')
                .setChromeOptions(options)
                .build();
            await driver.get("https://studybay.app/order/search");
            console.log(`BROWSER OPENED,ADDING COOKIES....`)

            for (var i = 0; i < contentJSON.length; i++) {
                await driver.manage().addCookie(contentJSON[i])
            }

            await driver.get("https://studybay.app/order/search");
            console.log(`BIDDING....`)
            refreshs = 0;

        }

        try {
            orders = await driver.wait(until.elementsLocated(By.xpath(locators.urgentOrders)), parseInt(botData.refreshRate) * 1000);
            refreshs++;
        } catch (err) {
            // console.error('err 101'+err);
            refreshs++;

            //check for many requests
            try {
                await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//center/h1[contains(text(),'429 Too Many Requests')]"))),1000)
                console.log("TOO MANY REQUESTS ERROR,SLOWING DOWN")
                try{
                    await driver.wait(until.elementLocated(By.css("HAKUNA")),5000)
                }catch(err){
                    console.log("PLEASE WAIT")
                }
            } catch (err) {
                process.stdout.write("0");
            }

            await driver.navigate().refresh();
            continue;

        }

        console.log(` orders[ ${orders.length}]`);

        

        // map(orders, e => e.findElement(By.xpath(".//a[@class='orderA-converted__name' or @class='orderA-converted__name orderA-converted__name--read']")).getText())
        //     .then(function (values) {
        //         console.log(values);
        //     });
        //     continue;
        for (let order of orders) {
            //get order ID
            if (skip_bidded_orders) {
                try {
                    orderID=await driver.wait(until.elementIsVisible(await order.findElement(By.xpath(".//a"))), 5000).getAttribute('href')
                    console.log(`ORDER ID ISSSSS: ${orderID}`)
                } catch (err) {
                    console.error('err 103-c' + err);
                    break;
                }
            }

            //filter out already bidded orders
            if(skip_bidded_orders){
                if(bidded.has(orderID)){
                    console.log('HAS ALREADY BEEN BIDDED ON',orderID)
                    await driver.sleep(3000)
                    console.log('...')
                    continue
                }
            }
             
            //the more button
            try {
                await driver.wait(until.elementIsVisible(await order.findElement(By.xpath(locators.more))), 5000).click();
            } catch (err) {
                console.error('err 103' + err);
                break;
            }
            
            

            //subject filter
            if (unwantedSubjects.size > 0) {
                try {
                    let subjectPlusCat = await driver.wait(until.elementIsVisible(await order.findElement(By.xpath(locators.subject))), 4000).getText();
                    let subject = subjectPlusCat.split(",")[1];
                    if (unwantedSubjects.has(subject.trim())) {
                        console.log(`${subject} is unwanted`)
                        await driver.wait(until.elementIsVisible(await order.findElement(By.xpath(locators.close))), 4000).click()
                        break;
                    }
                } catch (err) {
                    console.error('err 103-B' + err);
                    break;
                }

            }
            //urgent order filter
            try{
                if (!botData.bidUrgent) {
                    let urgentArea=await driver.wait(until.elementIsVisible(order.findElement(By.xpath(".//div[1]"))),500).getAttribute('class')
                    if (urgentArea.includes('orderA-converted__status--quick')) {
                        console.log('Urgent order ,,moving on...')
                        //close order and refresh
                        await driver.wait(until.elementIsVisible(order.findElement(By.xpath(locators.close))), 4000).click()
                        break;

                    }
                }   
            }catch(err){
                console.error('103-c' + err);

            }
            //start bidding
            try {
                await driver.wait(until.elementIsVisible(await order.findElement(By.xpath(locators.start_bidding))), 5000).click();
            } catch (err) {
                console.error('err 104' + err);
                break;
            }


            //message dropdown
            try {
                let messageDropdown = await driver.wait(until.elementLocated(By.css(locators.message_dropDown)), 10000);
                await driver.executeScript("arguments[0].click();", messageDropdown);
            } catch (err) {
                console.error('err 106' + err);
                break;
            }

            //message select
            try {
                let messageSelect=await driver.wait(until.elementLocated(By.xpath(locators.message_select)), 5000)
                await driver.executeScript("arguments[0].click();", messageSelect);
            } catch (err) {
                console.error('err 107' + err);
                break;
            }

            //enter price
            if (botData.priceLevel.toLowerCase() !== "none" || botData.priceLevel.length > 1) {
                try {
                    let inputField = await driver.wait(until.elementLocated(By.xpath(locators.price_input)), 5000);
                    switch (botData.priceLevel.toLowerCase()) {
                        case "minimum":
                            inputField.sendKeys(await driver.findElement(By.xpath("//span[@color='#f6be4e']")).getText())
                            break;
                        case "average":
                            inputField.sendKeys(await driver.findElement(By.xpath("//span[@color='#98bb71']")).getText())
                            break;

                        case "maximum":
                            inputField.sendKeys(await driver.findElement(By.xpath("//span[@color='#e95454']")).getText())
                            break;

                        default:
                            break;
                    }
                } catch (err) {
                    console.error('err 108' + err);
                    break;
                }
            }

            // finish bid
            try {
                await driver.wait(until.elementLocated(By.xpath(locators.start_bidding2)), 5000).click();
                process.stdout.write("*");
            } catch (err) {
                console.error('err 109' + err);
                break;
            }

            //save already bidded orders to array
            if(skip_bidded_orders){
                bidded.add(orderID)
            }

            //close modal    
            try {
                let closeModal = await driver.wait(until.elementLocated(By.xpath(locators.modal_close)), 5000);
                await driver.executeScript("arguments[0].click();", closeModal);
                process.stdout.write("x");
            } catch (err) {
                console.error('err 110' + err);
                break;
            }

            // break
        }

        await driver.navigate().refresh();


    }


};