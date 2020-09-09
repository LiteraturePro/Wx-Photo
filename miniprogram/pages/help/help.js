// pages/help/help.js
Page({
    data: {
        contents:'https://github.com/LiteraturePro/Wx-Photo'
      },
      copyText: function (e) {
        console.log(e)
        wx.setClipboardData({
          data: e.currentTarget.dataset.text,
          success: function (res) {
            wx.getClipboardData({
              success: function (res) {
                wx.showToast({
                  title: '复制成功'
                })
              }
            })
          }
        })
      },
    preview: function () {
        wx.reportAnalytics('log', {
            position: 'preview',
            status: 'none'
        });
        wx.previewImage({
            urls: ['https://pcdn.wxiou.cn//20200826170456.jpg']
        });
    }
})