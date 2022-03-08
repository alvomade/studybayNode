const {Builder, By, Key, until, WebElement,Capabilities,WebDriver} = require('./node_modules/selenium-webdriver');
require('chromedriver');
var chrome = require("selenium-webdriver/chrome");
const axios=require('axios')
const fs=require('fs')
const rw=require('./readWrite')

var options = new chrome.Options();
// options.addArguments("--headless");
// options.addArguments("dissable-gpu")
options.addArguments("--disable-logging");
options.addArguments("--log-level=3");

function validateSub(botID){
    return new Promise((resolve,reject)=>{
        axios.get(`http://192.168.100.48:3000/sb/${botID}`).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err)
        })
    })

}

    async function runBot (email,password) {
        let cookieExists=false;
        let driver = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

            // Navigate to Url
            await driver.get('https://studybay.app');

            if (fs.existsSync('cookie.json')) {
                let content = fs.readFileSync('cookie.json')

                if(content.length>=1){
                    let contentJSON=await JSON.parse(content)
                    for(var i=0;i<contentJSON.length;i++){
                        await driver.manage().addCookie(contentJSON[i])
                     }
                     cookieExists=true;
                }
                
            }

            if (!cookieExists) {
                try{
                // Enter text "cheese" and perform keyboard action "Enter"
                await driver.wait(until.elementLocated(By.name('email')), 10000).sendKeys(email);

                await driver.wait(until.elementLocated(By.name('password')), 10000).sendKeys(password);

                await driver.wait(until.elementLocated(By.xpath('//button')), 5000).click();

                await driver.wait(until.titleIs('Studybay'), 5000);
                }catch(err){
                    console.log('err 100'+err)
                }
            }
            

            await driver.get("https://studybay.app/order/search");

            //save cookies if there  is none 
            if (!cookieExists) {
                driver.manage().getCookies().then(function (cookies) {

                    var cookiesJson = JSON.stringify(cookies, null, 4);
                    console.log(cookiesJson);

                    fs.writeFile('cookie.json', cookiesJson.toString(), (err) => {
                        if (err) {
                            console.log('cookie not saved')
                        }
                        console.log('cookie saved ')
                    })
                });
            }

            var orders = '';
            let refreshs=0

            while (1 > 0) {

                //
                console.log('REFRESHES: ',refreshs)
                if(refreshs>1){
                    await driver.get('chrome://settings/clearBrowserData');

                    try{

                        await driver.get('chrome://settings/clearBrowserData');
                        try{
                        setInterval(()=>{
                            // let selector = "return document.querySelector(`settings-ui`).shadowRoot.querySelector(`settings-main`).shadowRoot.querySelector(`settings-basic-page`).shadowRoot.querySelector(`settings-section > setting-privacy-page`).shadowRoot.querySelector(`settings-clear-browsing-data-dialog`).shadowRoot.querySelector(`#clearBrowsingDataDialog`).querySelector(`#clearBrowsingDataConfirm`).click()"
                            
                            driver.executeScript("document.querySelector(`settings-ui`).shadowRoot.querySelector(`settings-main`).shadowRoot.querySelector(`settings-basic-page`).shadowRoot.querySelector(`settings-section > setting-privacy-page`).shadowRoot.querySelector(`settings-clear-browsing-data-dialog`).shadowRoot.querySelector(`#clearBrowsingDataDialog`).querySelector(`#clearBrowsingDataConfirm`).click()")
                            
                        },5000)
                        }catch(err){console.log(`weeeee`,err)}
                        
                    // let root=await driver.findElement(By.tagName("settings-clear-browsing-data-dialog"))
                    // let shadowDom1=await driver.executeScript("return arguments[0].shadowRoot", root);
                    // let crDialog=shadowDom1.findElement(By.tagName("cr-dialog"))    
                    // let buttonContainer=crDialog.findElement(By.xpath("//div[@slot='button-container']"))
                    // buttonContainer.findElement(By.css('cr-button#clearBrowsingDataConfirm')).click()
                    }catch(err){
                        console.log(`ERROR CLEARING.....`,err)
                    }
                    

                    setTimeout(()=>{
                         driver.get('https://studybay.app/order/search')
                    },5000)

                    refreshs=0
                    

                }

                try {
                    orders = await driver.wait(until.elementsLocated(By.xpath("//div[@class='orderA-converted__order' or @class='orderA-converted__order orderA-converted__order--premium'or @class='orderA-converted__order orderA-converted__order--paid' or @class='orderA-converted__order orderA-converted__order--quick' or div/div/div/div/span[@class='core__OfferRoot-sc-1xnwx2r-0 mmMJL']]/div")), 3000);
                    refreshs++;
                    // console.log(`ORDERS NI  ${orders.getAttribute("class")}`);
                } catch (err) {
                    // console.error('err 101'+err);
                    refreshs++;
                    process.stdout.write("-");
                    await driver.navigate().refresh();
                    continue;

                }

                console.log(`AVAILABLE ORDERS ${orders.length}`);



                for (var order in orders) {
                    try {
                        var oda = await driver.findElement(By.xpath("//div[@class='orderA-converted__order' or @class='orderA-converted__order orderA-converted__order--premium'or @class='orderA-converted__order orderA-converted__order--paid' or @class='orderA-converted__order orderA-converted__order--quick' or div/div/div/div/span[@class='core__OfferRoot-sc-1xnwx2r-0 mmMJL']]/div")).getAttribute('innerHTML');
                        process.stdout.write("*");
                    } catch (err) {
                        console.error('err 102' + err);
                    }

                    //the more button
                    try {
                        await driver.wait(until.elementLocated(By.xpath("//div[@class='orderA-converted__order' or @class='orderA-converted__order orderA-converted__order--premium'or @class='orderA-converted__order orderA-converted__order--paid' or @class='orderA-converted__order orderA-converted__order--quick' or div/div/div/div/span[@class='core__OfferRoot-sc-1xnwx2r-0 mmMJL']]/div//button[@class='ExpandButton__Expand-sc-1abt4gw-0 lcvquB']")), 3000).click();
                    } catch (err) {
                        console.error('err 103' + err);
                        break;
                    }

                    //start bidding
                    try {
                        await driver.wait(until.elementLocated(By.xpath("//div[@class='orderA-converted__order' or @class='orderA-converted__order orderA-converted__order--premium'or @class='orderA-converted__order orderA-converted__order--paid' or @class='orderA-converted__order orderA-converted__order--quick' or div/div/div/div/span[@class='core__OfferRoot-sc-1xnwx2r-0 mmMJL']]/div//div[@class='styled__MakeBidWrapper-sc-1uth75u-6 bMIqwS']/button")), 3000).click();
                    } catch (err) {
                        console.error('err 104' + err);
                        continue;
                    }

                    // if((await oda.includes("base__DeadlineEmojiRoot-sc-i0cmwy-2 hWFPQH"))){
                    //     console.log("KUNA URGENT ORDER HAPAAAAAAAAAA");
                    //     //start bidding
                    //     try {
                    //         await driver.wait(until.elementLocated(By.xpath("//button[@class='styled__StyledButton-sc-5xmk3z-0 kbyLRS']")),3000).click();
                    //     } catch (err) {
                    //         console.error('err 105'+err);
                    //         continue;
                    //     }
                    // }else{
                    //     console.log("HAKUNAAAAAAAAAA");
                    // }

                    //message dropdown
                    try {
                        let messageDropdown = await driver.wait(until.elementLocated(By.xpath("(//div[@class='styled__Field-sc-tkvsdl-1 levjpM']/div)[last()]")), 3000);
                        await driver.executeScript("arguments[0].click();", messageDropdown);
                    } catch (err) {
                        console.error('err 106' + err);
                        continue;
                    }

                    //message select
                    try {
                        await driver.wait(until.elementLocated(By.xpath("(//div[@placeholder='Choose a template']/following-sibling::div/div)[last()]")), 3000).click();
                    } catch (err) {
                        console.error('err 107' + err);
                        continue;
                    }
                    //finish bid
                    try {
                        await driver.wait(until.elementLocated(By.xpath("(//button[@class='styled__StyledButton-sc-5xmk3z-0 fcfDbB'])[last()]")), 3000).click();
                        process.stdout.write("*");
                    } catch (err) {
                        console.error('err 108' + err);
                        continue;
                    }

                    //close modal    
                    try {
                        let closeModal=await driver.wait(until.elementLocated(By.xpath("//button[@class='ui-modal-close']")), 3000);
                        await driver.executeScript("arguments[0].click();", closeModal);
                        process.stdout.write("x");
                    } catch (err) {
                        console.error('err 109' + err);
                        continue;
                    }


                }

                await driver.navigate().refresh();

                
            }

        
};
  
rw.getBotId().then((botID)=>{
    //after registering bot or getting botId
    console.log('BOT ID: ',botID)
    validateSub(botID)
        .then((result) => {
            if (!result.data[0].active) {
                console.log('subscription expired');
            } else {
                // console.log('subscription is ACTIVE ,exp on: ', result.data[0].end);
                runBot("studybaywriter14@gmail.com", "deno2019")
            }
        })
})




