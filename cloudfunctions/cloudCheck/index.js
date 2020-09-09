// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_NEW
})

// 云函数入口函数
exports.main = async (event, context) => {
  const fileID = event.fileID
  const res = await cloud.downloadFile({
    fileID: fileID,
  })
  cloud.callFunction({
    name: 'detele_img',
    data: {
      fileID: fileID
    }
})
  const buffer = res.fileContent
  try {
    var result = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: event.contentType,
        value: buffer
      }
    });
    return result
  } catch (err) {
    return err
  }
  

}