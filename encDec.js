const crypto = require("crypto");


const ENC_KEY = "bf3c199c2470cb477d907b1e0917c17b"; // set random encryption key
const IV = "5183666c72eec9e4"; // set random initialisation vector


exports.enc = (readable) => {
    let cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
    let encrypted = cipher.update(readable, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

exports.dec = (cypher) => {
    let decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
    let decrypted = decipher.update(cypher, 'base64', 'utf8');
    decrypted = decrypted + decipher.final('utf8');
    return decrypted;
}
