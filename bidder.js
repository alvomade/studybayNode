const { Builder, By, Key, until, WebElement, Capabilities, WebDriver } = require('selenium-webdriver');
require('chromedriver');
const chrome = require("selenium-webdriver/chrome");
const readWrite=require('./readWrite')
let contentJSON = [];
let login=false
var options = new chrome.Options();
// options.addArguments("--headless");
// options.addArguments("dissable-gpu")
options.addArguments("--disable-logging");
options.addArguments("--log-level=3");


exports.runBot=async (botData)=> {
    // var selectors=[];
    
    // readWrite.getSelectors().then((data)=>{

    //     // for(var sel in data){
    //     //     var arrayValue=data[sel]
    //     //     // selectors[sel.name]=sel.locator
            
    //     //     selectors[`${arrayValue.name}`]=arrayValue.locator
            
    //     // }
    //     // selectors=data.map(a => a.locator)
    //     selectors=data;
    //     console.log(data)

    // }).catch(err=>console.log(err))
    // console.log("subjectttt...",selectors)
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

            await driver.wait(until.titleIs('Studybay'), 10000);
            login=true
        } catch (err) {
            console.log('ERROR LOGIN IN..TRY AGAIN')
            login=false

        }
    }


    await driver.get("https://studybay.app/order/search");

    //save cookies if there  is none 
    if (contentJSON.length <= 0) {
        driver.manage().getCookies().then(function (cookies) {
            contentJSON = cookies
            if(login){
            console.log('SUCCESSFUL LOGIN....BIDDING...')
            } 

        });
    }

    var orders = '';
    let refreshs = 0

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
            orders = await driver.wait(until.elementsLocated(By.xpath("//div[@class='orderA-converted__order' or @class='orderA-converted__order orderA-converted__order--premium' or @class='orderA-converted__order orderA-converted__order--paid' or @class='orderA-converted__order orderA-converted__order--quick' or @class='orderA-converted__order orderA-converted__order--paid orderA-converted__order--quick' or div/div/div/div/span[@class='core__OfferRoot-sc-1xnwx2r-0 Ekvmc']]/div")), parseInt(botData.refreshRate) * 1000);
            refreshs++;
            // console.log(`ORDERS NI  ${orders.getAttribute("class")}`);
        } catch (err) {
            // console.error('err 101'+err);
            refreshs++;
            process.stdout.write("-");
            await driver.navigate().refresh();
            continue;

        }

        console.log(` orders[ ${orders.length}]`);



        for (var order in orders) {

            //the more button
            try {
                await driver.wait(until.elementLocated(By.xpath("//div[@class='orderA-converted__order' or @class='orderA-converted__order orderA-converted__order--premium' or @class='orderA-converted__order orderA-converted__order--paid' or @class='orderA-converted__order orderA-converted__order--quick' or @class='orderA-converted__order orderA-converted__order--paid orderA-converted__order--quick' or div/div/div/div/span[@class='core__OfferRoot-sc-1xnwx2r-0 Ekvmc']]/div//button[@class='ExpandButton__Expand-sc-1abt4gw-0 iIDguA']")), 3000).click();
            } catch (err) {
                console.error('err 103' + err);
                break;
            }

            //subject filter
            if (unwantedSubjects.size > 0) {
                try {
                    let subjectPlusCat = await driver.wait(until.elementLocated(By.xpath("//div[@class='orderA-converted__category' or @class='orderA-converted__category orderA-converted__category--offered']")), 4000).getText();
                    let subject = subjectPlusCat.split(",")[1];
                    if (unwantedSubjects.has(subject.trim())) {
                        console.log(`${subject} is unwanted`)
                        await driver.wait(until.elementLocated(By.xpath("//button[@class='styled__Wrapper-sc-pq4ir6-0 bShWWg']")), 4000).click()
                        break;
                    }
                } catch (err) {
                    console.error('err 103-B' + err);
                    break;
                }

            }
            //urgent order filter
            // try{
            //     if (botData.bidUrgent) {
            //         let urgentArea=await driver.wait(until.elementLocated(By.xpath("//div[@class='base__DeadlineRoot-sc-i0cmwy-0 bWvlUZ']")),500).getAttribute('innerHTML')
            //         // order.getAttribute('innerHTML').includes()
            //         if (urgentArea.includes('base__DeadlineEmojiRoot-sc-i0cmwy-2 hWFPQH')) {
            //             console.log('Urgent order GETTING RID OF IT')
            //             //close order and refresh
            //             await driver.wait(until.elementLocated(By.xpath("//div[@class='orderA-converted__order' or @class='orderA-converted__order orderA-converted__order--premium'or @class='orderA-converted__order orderA-converted__order--paid' or @class='orderA-converted__order orderA-converted__order--quick' or div/div/div/div/span[@class='core__OfferRoot-sc-1xnwx2r-0 mmMJL']]/div//button[@class='styled__Wrapper-sc-pq4ir6-0 fKXtHI']")), 4000).click()
            //             break;

            //         }
            //     }   
            // }catch(err){
            //     console.error('103-B' + err);

            // }
            //start bidding
            try {
                await driver.wait(until.elementLocated(By.xpath("//button[@class='styled__StyledButton-sc-5xmk3z-0 kMHpa styled__MakeBidButton-sc-1uth75u-9 JkCDS' or @class='styled__StyledButton-sc-5xmk3z-0 ggIyto styled__MakeBidButton-sc-1uth75u-9 JkCDS']")), 3000).click();
            } catch (err) {
                console.error('err 104' + err);
                break;
            }

           

            //message dropdown
            try {
                let messageDropdown = await driver.wait(until.elementLocated(By.xpath("//div[@class='styled__Field-sc-tkvsdl-1 dIpAlL']")), 3000);
                await driver.executeScript("arguments[0].click();", messageDropdown);
            } catch (err) {
                console.error('err 106' + err);
                break;
            }

            //message select
            try {
                await driver.wait(until.elementLocated(By.xpath("//div[@class='styled__OptionList-sc-tkvsdl-4 busdaf']")), 3000).click();
            } catch (err) {
                console.error('err 107' + err);
                break;
            }

            //enter price
            if (botData.priceLevel.toLowerCase() !== "none" || botData.priceLevel.length > 1) {
                try {
                    let inputField = await driver.wait(until.elementLocated(By.xpath("(//div[@class='sb-makeOffer-converted__input']//input)[last()]")), 3000);
                    switch (botData.priceLevel.toLowerCase()) {
                        case "minimum":
                            inputField.sendKeys(await driver.findElement(By.xpath("//span[@color='#f6be4e']")).getText())
                            break;
                        case "average ":
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

            //finish bid
            try {
                await driver.wait(until.elementLocated(By.xpath("(//button[@class='styled__StyledButton-sc-5xmk3z-0 kMHpa'])[last()]")), 3000).click();
                process.stdout.write("*");
            } catch (err) {
                console.error('err 108' + err);
                break;
            }

            //close modal    
            try {
                let closeModal = await driver.wait(until.elementLocated(By.xpath("//button[@class='ui-modal-close']")), 3000);
                await driver.executeScript("arguments[0].click();", closeModal);
                process.stdout.write("x");
            } catch (err) {
                console.error('err 109' + err);
                break;
            }


        }

        await driver.navigate().refresh();


    }


};