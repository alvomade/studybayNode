const fs=require('fs')
const axios=require('axios')

let raw=fs.readFileSync('settings.json')
let data=JSON.parse(raw)

exports.getBotId=()=>{
    return new Promise((resolve,reject)=>{
        if(data.botID){
            resolve(data.botID) 
        }else if(data.activationCode.length!=0){
            axios.get(`http://192.168.100.48:3000/sb/trans/0713151023`).then((result)=>{
                data.botID = result.data.id
                console.log('BOT ID IS.....',result.data.id)
                fs.writeFileSync('settings.json', JSON.stringify(data))
                resolve(result.data.id)
            }).catch((err) => {
                console.log(err)
            })
        }else{
            if(data.email){
                axios.post(`http://192.168.100.48:3000/sb/${data.email}`).then((result) => {

                    //write the new bot id to local file
                    data.botID = result.data.id
                    console.log('BOT ID IS.....',result.data.id)
                    fs.writeFileSync('settings.json', JSON.stringify(data))
                    resolve(result.data.id)

                }).catch((err) => {
                    console.log(err)
                })
            }else{console.log('email is missing in settings file')}
        }
    })
    
}


