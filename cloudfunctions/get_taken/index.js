// 云函数入口文件
const cloud = require('wx-server-sdk');

const getAccessToken = require('./get-access-token');
const getFaceData = require('./get-face-data');
const handleResult = require('./handle-data-result');

cloud.init();


// 云函数入口函数
exports.main = async (event, context) => {
    
    let token = await getAccessToken();
    console.log(token)
    return token
      
};

