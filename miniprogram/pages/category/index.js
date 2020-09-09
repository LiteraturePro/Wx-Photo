var FSM = wx.getFileSystemManager();
let guid = require('../utils/guid.js')
let appInstance = getApp()



Page({
  data: {
    width: wx.getSystemInfoSync().windowWidth,
    height: wx.getSystemInfoSync().windowHeight,
    current_page: 1,
    showModal: false,
  
  },


  onLoad: function (options) {
    let type = options.type || '其他'
    this.setData({
      type: type
    })
    this._get18(1)
    this._showNum()
  },


  // _clearImgsStorage(){
  //   let img_time = wx.getStorageSync('img_time')
  //   //第一次设置时间
  //   if (!img_time) {
  //     return wx.setStorageSync('img_time', new Date())
  //   }
  //   //超过23小时，重制时间和清空数据
  //   let dis_time = (new Date() - new Date(img_time)) / 1000
  //   if (dis_time > 23 * 60 * 60) {
  //     //清空，说明 img temp url 已经失效了
  //     wx.clearStorageSync()
  //     return wx.setStorageSync('img_time', new Date())
  //   }
  // },

  _get18(page) {
    wx.showLoading({
      title: '加载中...'
    })
    wx.cloud.callFunction({
      name: 'get_list',
      data: {
        type: this.data.type,
        page: page
      }
    }).then(res => {
      if (res.errMsg == 'cloud.callFunction:ok') {
        this._setList(res.result.data)
      }
    })

  },
  onInspection() {
      this.setData({
        showModal: true
      })
    },
    /**
     * 弹出框蒙层截断touchmove事件
     */
    preventTouchMove: function () {
    },
    /**
     * 隐藏模态对话框
     */
    hideModal: function () {
      this.setData({
        showModal: false
      });
    },
    /**
     * 对话框取消按钮点击事件
     */
    onCancel: function () {
      this.hideModal();
    },
    /**
     * 对话框确认按钮点击事件
     */
    onConfirm: function () {
      this.hideModal();
    },

  //拉取图片
  _setList(data) {
    let imgs = []
    let tempdata = []
    let preview_imgs = []

    for (let i in data) {
      imgs.push(data[i].fileID)
      //判断缓存中是否命中
      if (appInstance.globalData[imgs[i]] && appInstance.globalData[imgs[i]].tempFileURL) {
        tempdata.push(appInstance.globalData[imgs[i]])
        preview_imgs.push(appInstance.globalData[imgs[i]].tempFileURL)
      }
    }
    //存在缓存，从缓存中取
    if (imgs.length == tempdata.length) {
      this.setData({
        items: tempdata,
        preview_imgs: preview_imgs
      })
      wx.hideLoading()
      return
    }

    wx.cloud.getTempFileURL({
      fileList: imgs,
      success: res => {
        for (let temp in res.fileList) {
          let t_url = res.fileList[temp].tempFileURL
          data[temp].tempFileURL = t_url
          preview_imgs.push(t_url)
          //将临时文件路径写进缓存
          appInstance.globalData[imgs[temp]] = data[temp]
        }
        this.setData({
          items: data,
          preview_imgs: preview_imgs
        })
      },
      fail: err => {

      },
      complete() {
        wx.hideLoading()
      }
    })

  },


  doUpload() {
    var that = this;
    wx.chooseImage({
      count: 9,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log(res.tempFilePaths.length)
        const FilePathss = res.tempFilePaths
        const FilePaths = res.tempFilePaths[0]

        console.log(FilePaths)
        var tempFilesSize = res.tempFiles[0].size;
        console.log(tempFilesSize)
        if (tempFilesSize <= 3145728) {
          const path = res.tempFilePaths[0]
          const filePath2 = res.tempFilePaths[0]
          const cloudPath = 'tmp-image/' + guid.guid() + filePath2.match(/\.[^.]+?$/)[0]
          wx.getFileInfo({
            filePath: path,
            success: function (res) {
              console.log(res);
            }
          })
          //-----压缩图片开始 (像素不超过750*1334)
          wx.getImageInfo({
            src: path,
            success: function (res) {

              let cW = res.width,
                cH = res.height;
              let cWidth = cW,
                cHeight = cH;

              if ((cW / cH) < 0.56) { //说明 要依高为缩放比例--0.56是 750/1334的结果
                if (cH > 1334) {
                  cHeight = 1334;
                  cWidth = (cW * 1334) / cH;
                }

              } else { //要依宽为缩放比例
                if (cW > 750) {
                  cWidth = 750;
                  cHeight = (cH * 750) / cW;
                }
              }
              console.log(parseInt(cWidth)); //计算出缩放后的宽
              console.log(parseInt(cHeight)); //计算出缩放后的高
              that.setData({
                cWidth: cWidth,
                cHeight: cHeight
              }); //让canvas大小和要缩放的图片大小一致

              let imageW = cWidth,
                imageH = cHeight,
                canvasId = "canvas",
                imagePath = res.path;
              const ctx = wx.createCanvasContext(canvasId);
              ctx.drawImage(imagePath, 0, 0, cW, cH, 0, 0, imageW, imageH);
              ctx.draw(false, setTimeout(function () { // 一定要加定时器，因为ctx.draw()应用到canvas是有个时间的
                wx.canvasToTempFilePath({
                  canvasId: canvasId,
                  x: 0,
                  y: 0,
                  width: imageW,
                  height: imageH,
                  destWidth: imageW,
                  destHeight: imageH,
                  quality: 1,
                  success: function (res) {
                    const tempFilePaths = res.tempFilePath
                    wx.getFileInfo({
                      filePath: res.tempFilePath,
                      success: function (res) {
                        console.log("777", res);
                      }
                    })
                    wx.cloud.uploadFile({
                      cloudPath: cloudPath,
                      filePath: res.tempFilePath,
                      success: res => {
                        wx.showLoading({
                          icon: 'none',
                          title: '审核图片ing',
                        })
                        res.fileID
                        console.log('上传成功：', res)
                        wx.cloud.callFunction({
                          name: 'cloudCheck',
                          data: {
                            contentType: 'image/jpg',
                            fileID: res.fileID
                          }
                        }).then(res => {

                          console.log("检测结果", res.result);
                          if (res.result.errCode == 0) {                        
                            that._upload(FilePathss, 0);
                          } else if (res.result.errCode != 87014) {
                            // 
                            wx.cloud.callFunction({
                              name: 'get_taken',
                              data: {}
                            }).then(res => {
                              console.log(res)
                              const taken = res.result
                              console.log(res.result)
                              FSM.readFile({
                                filePath: tempFilePaths,
                                encoding: "base64",
                                success: function (data) {
                                  var base64Img = data.data
                                  //token存在
                                  wx.request({
                                    url: 'https://aip.baidubce.com/rest/2.0/solution/v1/img_censor/v2/user_defined?access_token=' + taken,
                                    method: 'POST',
                                    data: {
                                      image: base64Img,
                                    },
                                    header: {
                                      'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    success: res => {
                                      wx.showLoading({
                                        title: '百度AI审核ing',
                                      })
                                      wx.hideLoading();
                                      console.log(res)
                                      //个人对返回数据做的判断，可以按自己的需要编写相应逻辑
                                      if (res.data.conclusionType == 1) {

                                        that._upload(FilePathss, 0);
                                      } else {
                                        wx.showModal({
                                          title: "存在违规图片"
                                        })
                                      }
                                    },
                                    fail: err => {
                                      wx.hideLoading();
                                      wx.showLoading({
                                        title: '百度审核ing',
                                      })
                                      that._upload(FilePathss, 0);
                                    }
                                  });
                                }

                              })
                              //
                            })
                          } else {
                            wx.showToast({
                              icon: 'none',
                              title: '图片含有敏感信息，换张图吧~',
                            })

                          }

                        })
                      },
                      fail: e => {
                        wx.showToast({
                          icon: 'none',
                          title: '图片上传失败！',
                        })
                      }
                    })
                    //打印处理后的图片信息
                  },
                });
              }, 200));
            }
          });
        } else if (tempFilesSize >= 3145728 && tempFilesSize <= 4194304) {
          var tempFilePaths = FilePaths
          wx.cloud.callFunction({
            name: 'get_taken',
            data: {}
          }).then(res => {
            wx.showLoading({
              title: '百度AI审核ing',
            })
            console.log(res)
            const taken = res.result
            console.log(res.result)
            FSM.readFile({
              filePath: tempFilePaths,
              encoding: "base64",
              success: function (data) {
                var base64Img = data.data
                //token存在
                wx.request({
                  url: 'https://aip.baidubce.com/rest/2.0/solution/v1/img_censor/v2/user_defined?access_token=' + taken,
                  method: 'POST',
                  data: {
                    image: base64Img,
                  },
                  header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                  },
                  success: res => {

                    wx.hideLoading();
                    console.log(res)
                    //个人对返回数据做的判断，可以按自己的需要编写相应逻辑
                    if (res.data.conclusionType == 1) {
                      that._upload(FilePathss, 0);
                    } else {
                      wx.showModal({
                        title: "存在违规图片"
                      })
                    }
                  },
                  fail: err => {
                    wx.hideLoading();
                    wx.showLoading({
                      title: '百度AI审核ing',
                    })
                    that._upload(FilePathss, 0);
                  }
                });
              }
            })
            //
          })
        } else if (tempFilesSize >= 4194304 && tempFilesSize <= 10485760) {
          // 华为处理
          var tempFilePaths = FilePaths
          const path = res.tempFilePaths[0]
          //-----压缩图片开始 (像素不超过750*1334)
          wx.getImageInfo({
            src: path,
            success: function (res) {
              //console.log(res);
              let cW = res.width,
                cH = res.height;
              let cWidth = cW,
                cHeight = cH;

              if ((cW / cH) < 0.56) { //说明 要依高为缩放比例--0.56是 750/1334的结果
                if (cH > 1334) {
                  cHeight = 1334;
                  cWidth = (cW * 1334) / cH;
                }

              } else { //要依宽为缩放比例
                if (cW > 750) {
                  cWidth = 750;
                  cHeight = (cH * 750) / cW;
                }
              }
              console.log(parseInt(cWidth)); //计算出缩放后的宽
              console.log(parseInt(cHeight)); //计算出缩放后的高
              that.setData({
                cWidth: cWidth,
                cHeight: cHeight
              }); //让canvas大小和要缩放的图片大小一致

              let imageW = cWidth,
                imageH = cHeight,
                canvasId = "canvas",
                imagePath = res.path;
              const ctx = wx.createCanvasContext(canvasId);
              ctx.drawImage(imagePath, 0, 0, cW, cH, 0, 0, imageW, imageH);
              ctx.draw(false, setTimeout(function () { // 一定要加定时器，因为ctx.draw()应用到canvas是有个时间的
                wx.canvasToTempFilePath({
                  canvasId: canvasId,
                  x: 0,
                  y: 0,
                  width: imageW,
                  height: imageH,
                  destWidth: imageW,
                  destHeight: imageH,
                  quality: 1,
                  success: function (res) {
                    const tempFilePaths = res.tempFilePath
                    wx.cloud.callFunction({
                      /// name: 'imgCheck',
                      name: 'get_taken',
                      data: {}
                    }).then(res => {
                      console.log(res)
                      const taken = res.result
                      console.log(res.result)
                      FSM.readFile({
                        filePath: tempFilePaths,
                        encoding: "base64",
                        success: function (data) {
                          var base64Img = data.data
                          wx.showLoading({
                            title: '华为AI审核ing',
                          })
                          //token存在
                          wx.request({
                            url: 'https://aip.baidubce.com/rest/2.0/solution/v1/img_censor/v2/user_defined?access_token=' + taken,
                            method: 'POST',
                            data: {
                              image: base64Img,
                            },
                            header: {
                              'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            success: res => {                              
                              wx.hideLoading();
                              console.log(res)
                              //个人对返回数据做的判断，可以按自己的需要编写相应逻辑
                              if (res.data.conclusionType == 1) {
                                that._upload(FilePathss, 0);
                              } else {
                                wx.showModal({
                                  title: "存在违规图片"
                                })
                              }
                            },
                            fail: err => {
                              wx.hideLoading();
                              wx.showLoading({
                                title: '华为AI审核ing',
                              })
                              that._upload(FilePathss, 0);
                            }
                          });
                        }
                      })
                      //
                    })

                  }
                })

              }, 200));
            }
          })
        } else if (tempFilesSize >= 10485760 && tempFilesSize <= 20971520) {
          wx.showLoading({
            title: '阿里AI审核ing',
          })
          this._upload(FilePathss, 0);
        } else {
          wx.showToast({
            title: '上传图片不能大于20M!', //标题
            icon: 'none' //图标 none不使用图标，详情看官方文档
          })
        }
      }
    })
  },
  // this._upload(res.tempFilePaths, 0)
  _upload(tempFiles, i) {
    const filePath = tempFiles[i]
    const cloudPath = 'pics/' + guid.guid() + filePath.match(/\.[^.]+?$/)[0]
    let tempFileID = '';
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        tempFileID = res.fileID
        //提前显示图片
        let pics = this.data.items
        let preview_imgs = this.data.preview_imgs
        pics.unshift({
          tempFileURL: filePath,
          fileID: tempFileID
        })
        preview_imgs.unshift(filePath)
        this.setData({
          items: pics,
          preview_imgs: preview_imgs
        })

        wx.cloud.callFunction({
          name: 'add_item',
          data: {
            fileID: res.fileID,
            type: this.data.type
          }
        }).then(res => {
          pics[0]._id = res.result._id
          this.setData({
            items: pics
          })
          wx.showToast({
            title: '第 ' + (parseInt(i) + 1) + ' 张图片上传成功',
            icon: 'none'
          })
          //将界面显示的数据变更
          this.setData({
            count: this.data.count + 1
          })
          //继续上传选中的下一张图片
          if (i + 1 < tempFiles.length) {
            i = i + 1
            this._upload(tempFiles, i)
          }
        }).fail(e => {
          //失败处理
          //从已经显示的图片里剔除第一个
          pics.shift()
          preview_imgs.shift()
          this.setData({
            items: pics,
            preview_imgs: preview_imgs
          })
          wx.showToast({
            title: '第 ' + (parseInt(i) + 1) + ' 张图片上传失败',
            icon: 'none'
          })
        })


      },
      fail: e => {
        wx.showToast({
          title: '第 ' + (parseInt(i) + 1) + ' 张图片上传失败',
          icon: 'none'
        })
      },
      complete: () => {
        // wx.showToast({
        //   title: '上传完成',
        // })
      }
    })

  },
  _upload2(tempFiles, i) {
    const filePath = tempFiles[i]
    const cloudPath = 'pics/' + guid.guid() + filePath.match(/\.[^.]+?$/)[0]
    let tempFileID = '';
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        tempFileID = res.fileID
        //提前显示图片
        let pics = this.data.items
        let preview_imgs = this.data.preview_imgs
        pics.unshift({
          tempFileURL: filePath,
          fileID: tempFileID
        })
        preview_imgs.unshift(filePath)
        this.setData({
          items: pics,
          preview_imgs: preview_imgs
        })

        wx.cloud.callFunction({
          name: 'add_item',
          data: {
            fileID: res.fileID,
            type: this.data.type
          }
        }).then(res => {
          pics[0]._id = res.result._id
          this.setData({
            items: pics
          })
          wx.showToast({
            title: '第 ' + (parseInt(i) + 1) + ' 张图片上传成功',
            icon: 'none'
          })
          //将界面显示的数据变更
          this.setData({
            count: this.data.count + 1
          })
          //继续上传选中的下一张图片
          if (i + 1 < tempFiles.length) {
            i = i + 1
            this._upload(tempFiles, i)
          }
        }).fail(e => {
          //失败处理
          //从已经显示的图片里剔除第一个
          pics.shift()
          preview_imgs.shift()
          this.setData({
            items: pics,
            preview_imgs: preview_imgs
          })
          wx.showToast({
            title: '第 ' + (parseInt(i) + 1) + ' 张图片上传失败',
            icon: 'none'
          })
        })


      }
    })
  },
  doPreview(event) {
    let url = event.currentTarget.dataset.objurl
    wx.previewImage({
      current: url,
      urls: this.data.preview_imgs
    })
  },

  doDelete(e) {
    let _id = e.currentTarget.dataset.objid
    let url = e.currentTarget.dataset.objurl
    let fileID = e.currentTarget.dataset.fileid
    let items = this.data.items
    let imgs = this.data.preview_imgs
    wx.showModal({
      title: '提醒',
      content: '确定要删除该图片吗？',
      success: res => {
        if (res.confirm) {

          wx.cloud.callFunction({
            name: 'delete_item',
            data: {
              fileID: fileID,
              _id: _id
            }
          }).then(res => {
            if (res.errMsg.indexOf('fail') < 0) {
              for (let i in items) {
                if (items[i]._id == _id) {
                  items.splice(i, 1)
                }
              }
              for (let i in imgs) {
                if (imgs[i] == url) {
                  imgs.splice(i, 1)
                }
              }
              this.setData({
                items: items,
                preview_imgs: imgs,
                count: this.data.count - 1
              })
            } else {
              wx.showToast({
                title: '服务异常，删除失败，请稍后再试',
                icon: 'none'
              })
            }

          })
        }
      }
    })
  },

  onReachBottom(event) {
    // console.log(event)
    // console.log(1)
  },

  _showNum() {
    wx.cloud.callFunction({
      name: 'get_count_page',
      data: {
        type: this.data.type
      }
    }).then(res => {
      this.setData({
        count: res.result.count,
        pagesize: res.result.pagesize,
        total_page: res.result.total_page
      })
    })
  },

  //上一页
  doPrePage() {
    let current_page = this.data.current_page
    let total_page = this.data.total_page
    if (1 < current_page) {
      this.setData({
        current_page: current_page - 1
      })
      this._get18(this.data.current_page)
    }
  },

  //下一页
  doNextPage() {
    let current_page = this.data.current_page
    let total_page = this.data.total_page
    if (current_page < total_page) {
      this.setData({
        current_page: current_page + 1
      })
      this._get18(this.data.current_page)
    }
  }

})