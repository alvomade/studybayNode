const fs=require('fs')
const axios=require('axios')
const encDec=require('./encDec')


exports.getBotData=()=>{
    return new Promise((resolve,reject)=>{
        let raw=fs.readFileSync('settings.json')
        let data=JSON.parse(raw)

        if(data.botID){
            resolve(data) 
        }else if(data.activationCode.length!=0){
            axios.get(`https://turbo.clink.co.ke/sb/trans/${data.activationCode}`).then((result)=>{
                data.botID = result.data.id
                console.log('BOT ID registered as:',result.data.id)
                fs.writeFileSync('settings.json', JSON.stringify(data))
                resolve(data)
            }).catch((err) => {
                console.log(err)
            })
        }else{
            if(data.email){
                axios.post(`https://turbo.clink.co.ke/sb/${data.email}`).then((result) => {

                    //write the new bot id to local file
                    data.botID = result.data.id
                    console.log('BOT ID IS.....',result.data.id)
                    fs.writeFileSync('settings.json', JSON.stringify(data))
                    resolve(data)

                }).catch((err) => {
                    console.log(err)
                })
            }else{console.log('email is missing in settings file')}
        }
    })
    
}
exports.editServer=()=>{
    
}




