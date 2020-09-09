const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
/**
 * 图片审核
 */
exports.main = async (event, context) => {
  //获取buffer流
  const {buffer} = event
  try {
    //调用imgSecCheck接口
    return await cloud.openapi.security.imgSecCheck({
      media:{
        //按照要求填写属性参数       
        contentType: 'image/png',
        value: Buffer.from(buffer)
      }
      
    })    
  } catch (error) {
    return error
  }
}