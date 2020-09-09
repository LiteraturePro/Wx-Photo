// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_NEW,
  throwOnNotFound: false
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const test = await cloud.deleteFile({
    fileList: [event.fileID],
  })
  
  
}