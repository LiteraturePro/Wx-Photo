// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  var fs = require("fs");
  //var path = event
  var path = "cloud://photo-jyx3s.7068-photo-jyx3s-1302974183/pics/7464B269-41F2-4E9A-93F4-D9A57AEFE9F3.jpg"
  fs.stat(path,function(err,stats){
    console.log(err);
    console.log(stats);
//    获取文件的大小；
    console.log(stats.size);
  })
  return stats.size
}