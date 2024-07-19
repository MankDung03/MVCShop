const jwt = require('jsonwebtoken');
const config=require("config");


const secretKey = 'uttacad'; // Key bí mật để ký và xác minh JWT


const sign=(email)=>{
    return jwt.sign({email},secretKey,{expiresIn:1200})

}
const verify=(token)=>{
    try{
        jwt.verify(token,secretKey);
        return true;
    }catch(error){
        return false;
    }
}

module.exports =  {sign,verify} ;