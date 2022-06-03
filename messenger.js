const {parentPort,workerData}=require('worker_threads')
const { Builder, By, Key, until, WebElement, Capabilities, WebDriver } = require('selenium-webdriver');
require('chromedriver');
const chrome = require("selenium-webdriver/chrome");
var options = new chrome.Options();
// options.addArguments("--headless");
// options.addArguments("dissable-gpu")
options.addArguments("--disable-logging");
options.addArguments("--log-level=3");

(async ()=>{
    workerData.alreadyMessaged=[]
    let driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    await driver.get('https://studybay.app/home/myorders?type=0') 
    
    for(let cook of workerData.cookies){
        await driver.manage().addCookie(cook)
    }

    await driver.get('https://studybay.app/home/myorders?type=0') 

    let orders=null
    let odaID=null
    while(1>0){
        // await driver.manage().setTimeouts( { implicit: 10000 } );

            // setTimeout(async()=>{
            //     console.log('WAITING KIASI')
            // },50000)

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
            

            //if already messaged ,continue to next    
            if(workerData.alreadyMessaged.includes(odaID)){
                console.log('ALREADY EXIST IN MESSEGED ARRAY')
                continue
            }

            // open the order page
            await driver.get(`https://studybay.app/order/getoneorder/${odaID}/`)

            //check if message was already sent
            try{
                await driver.wait(until.elementLocated(By.xpath("//div[@class='im__content_message-text '] ")),10000)
                console.log('KUNA MESSAGE ALREADY')
                // await driver.executeScript('arguments[0].click()',oda)
                workerData.alreadyMessaged.push(odaID)

                //redirect to 'chat auction'
                await driver.get("https://studybay.app/home/myorders?type=0")
                break

            }catch(err){
                console.log('WRITING MESSAGE...................',err)
                try{
                    await driver.wait(until.elementLocated(By.id(`comment`)),15000).sendKeys(workerData.secondMessage)
                    let sendBtn=await driver.wait(until.elementLocated(By.id(`control_submitter`)),5000)
                    await driver.executeScript('arguments[0].click()',sendBtn)
                    workerData.alreadyMessaged.push(odaID)
                    await driver.get("https://studybay.app/home/myorders?type=0")
                }catch(err){
                    console.log('err 202',err)
                }
               
            }
            
            
            break
        }

        await driver.get("https://studybay.app/home/myorders?type=0")
        // setTimeout(async()=>{
        //     console.log('REFRESH AFTER 10 SECONDS')
        //     await driver.get("https://studybay.app/home/myorders?type=0")
        //     //  await driver.navigate().refresh();
        // },10000)
        
        
    }
    return parentPort.postMessage(workerData)
    
})()


