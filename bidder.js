const {Builder, By, Key, until, WebElement,Capabilities,WebDriver} = require('selenium-webdriver');
require('chromedriver');
var chrome = require("selenium-webdriver/chrome");
const axios=require('axios')
const fs=require('fs')
const rw=require('./readWrite') 
const encDec=require('./encDec')

//server area
const express=require('express')
const app=express()
const body_parser=require('body-parser')
app.set('view engine','ejs')

app.use(body_parser.urlencoded({extended:false}))



app.get('/',(req,res)=>{
    let raw=fs.readFileSync('settings.json')
    let data=JSON.parse(raw)
    res.render('index',{data:data})
})

var server=app.listen(3000,()=>"server is running");
//server area end

var options = new chrome.Options();
// options.addArguments("--headless");
// options.addArguments("dissable-gpu")
options.addArguments("--disable-logging");
options.addArguments("--log-level=3");


let contentJSON=[];

async function settings(){
    return new Promise((resolve,reject)=>{
        let raw=fs.readFileSync('settings.json')
        let data=JSON.parse(raw)

       let driver = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
            // if(data.botID){
                driver.get("http://localhost:3000");

                app.post('/',(req,res)=>{
                    
                    data.email=req.body.email
                    data.password=req.body.password
                    data.unwantedSubjects=req.body.unwantedSubjects.trim().split(",")
                    data.priceLevel=req.body.priceLevel
                    data.refreshRate=req.body.refreshRate
                    if(req.body.bidUrgent==="on"){
                        data.bidUrgent=true
                    }else{
                        data.bidUrgent=false
                    }

                    fs.writeFileSync('settings.json', JSON.stringify(data))
                    res.end()
                    driver.quit()  
                    resolve(data)
                      
                    
                }) 

      
             
           
        
    })
}


function validateSub(botID){
    return new Promise((resolve,reject)=>{
        axios.get(`https://turbo.clink.co.ke/sb/${botID}`).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err)
        })
    })

}

    async function runBot (botData) {
        console.log(JSON.stringify(botData))
        const unwantedSubjects=new Set(botData.unwantedSubjects)
        let driver = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();


        //create and login to a server
        


            // Navigate to Url
            await driver.get('https://studybay.app');
            console.log(`THERE ARE COOKIES${contentJSON.length}`)
            if(contentJSON.length>=1){
                console.log(`THERE ARE COOKIES${contentJSON.length}`)
                for(var i=0;i<contentJSON.length;i++){
                    await driver.manage().addCookie(contentJSON[i])
                 }
            }
         

            if (contentJSON.length<=0) {
                try{
                // Enter text "cheese" and perform keyboard action "Enter"
                await driver.wait(until.elementLocated(By.name('email')), 10000).sendKeys(botData.email);

                await driver.wait(until.elementLocated(By.name('password')), 10000).sendKeys(botData.password);

                await driver.wait(until.elementLocated(By.xpath('//button')), 5000).click();

                await driver.wait(until.titleIs('Studybay'), 10000);
                }catch(err){
                    console.log('ERROR LOGIN IN..TRY AGAIN')
                }
            }
            

            await driver.get("https://studybay.app/order/search");

            //save cookies if there  is none 
            if (contentJSON.length<=0) {
                driver.manage().getCookies().then(function (cookies) {
                    contentJSON=cookies
                    console.log('COOKIE saved')
                    
                    
                });
            }

            var orders = '';
            let refreshs=0

            while (1 > 0) {

                //
                
                if(refreshs>=100){
                    console.log('CLEARING MEMORY,PLEASE WAIT...: ',refreshs)
                    await driver.close();
                     driver =  new Builder()
                        .forBrowser('chrome')
                        .setChromeOptions(options)
                        .build();
                    await driver.get("https://studybay.app/order/search");
                    console.log(`BROWSER OPENED,ADDING COOKIES....`)

                    for(var i=0;i<contentJSON.length;i++){
                        await driver.manage().addCookie(contentJSON[i])
                     }

                     await driver.get("https://studybay.app/order/search");
                     console.log(`BIDDING....`)
                     refreshs=0;

                }

                try {
                    orders = await driver.wait(until.elementsLocated(By.xpath("//div[@class='orderA-converted__order' or @class='orderA-converted__order orderA-converted__order--premium'or @class='orderA-converted__order orderA-converted__order--paid' or @class='orderA-converted__order orderA-converted__order--quick' or div/div/div/div/span[@class='core__OfferRoot-sc-1xnwx2r-0 mmMJL']]/div")), parseInt(botData.refreshRate)*1000);
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
                    try
                     {
                        await driver.wait(until.elementLocated(By.xpath("//div[@class='orderA-converted__order' or @class='orderA-converted__order orderA-converted__order--premium'or @class='orderA-converted__order orderA-converted__order--paid' or @class='orderA-converted__order orderA-converted__order--quick' or div/div/div/div/span[@class='core__OfferRoot-sc-1xnwx2r-0 mmMJL']]/div//button[@class='ExpandButton__Expand-sc-1abt4gw-0 lcvquB']")), 3000).click();
                    } catch (err) {
                        console.error('err 103' + err);
                        break;
                    }

                    //subject filter
                    if(unwantedSubjects.size>0){
                        try{
                            let subjectPlusCat= await driver.wait(until.elementLocated(By.xpath("//div[@class='orderA-converted__category orderA-converted__category--offered' or @class= 'orderA-converted__category']")), 4000).getText();
                            let subject=subjectPlusCat.split(",")[1];
                            if(unwantedSubjects.has(subject.trim())){
                                console.log(`${subject} is unwanted`)
                                await driver.wait(until.elementLocated(By.xpath("//div[@class='orderA-converted__order' or @class='orderA-converted__order orderA-converted__order--premium'or @class='orderA-converted__order orderA-converted__order--paid' or @class='orderA-converted__order orderA-converted__order--quick' or div/div/div/div/span[@class='core__OfferRoot-sc-1xnwx2r-0 mmMJL']]/div//button[@class='styled__Wrapper-sc-pq4ir6-0 fKXtHI']")), 4000).click()
                                break;
                            }
                         }catch(err){
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

                    //enter price
                    if(botData.priceLevel.toLowerCase() !=="none" || botData.priceLevel.length>1){
                        try {
                            let inputField=await driver.wait(until.elementLocated(By.xpath("(//input[@type='text'])[last()]")), 3000);
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
                            continue;
                        }
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
  
settings().then((currentSettings)=>{
    server.close()
    rw.getBotData().then((botData)=>{
        //after registering bot or getting botId
        console.log('BOT ID...: ',botData.botID)
        validateSub( currentSettings.botID ||botData.botID)
            .then((result) => {
                if (!result.data[0].active) {
                    console.log('subscription expired');
                } else if(result.data[0].active) {
                    console.log('subscription is ACTIVE ,exp on: ', result.data[0].end);
    
                    //validate one subscription one user
                    if(encDec.enc(currentSettings.email)===result.data[0].user || result.data[0].user==null){
                        // f(result.data[0].user==null){
                        //     //update user field in db
                        // }
                        runBot(currentSettings)
                    }else{
                        console.log('subscription belongs to another user/wrong email,contact admin for help')
                    }
                    
                }
            })
    })
})






