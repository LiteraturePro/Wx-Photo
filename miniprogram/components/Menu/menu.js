var systemInfo = wx.getSystemInfoSync();
Component({
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      this.setData({
        systemInfo: systemInfo

      })
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,//是否已经弹出
    animMain: {},//旋转动画
    animImg: {},//原始影像动画
    animMedicalhistory: {},// 病历文书动画
    animInspection:{},//检验报告动画
    animcheck:{},//检查报告动画
    animItem:{},//图标背景动画
    animTime: 300,//动画持续时间，单位 ms
    timingFunction_start: 'ease-out',//动画的效果
    timingFunction_end: 'ease-out'//动画的效果


  },

  /**
   * 组件的方法列表
   */
  methods: {
    //点击弹出或者收起
    showOrHide: function () {
      if (this.data.isShow) {
        //缩回动画
        this.takeback();
        this.setData({
          isShow: false,

        })
      } else {
        //弹出动画
        this.popp();
        this.setData({
          isShow: true,

        })
      }
    },
    img: function () {
      this.triggerEvent("img")
      this.showOrHide()
    },
    medicalhistory: function () {
      this.triggerEvent("medicalhistory")
      this.showOrHide()
    },

    inspection: function () {
      this.triggerEvent("inspection")
      this.showOrHide()
    },
    check: function () {
      this.triggerEvent("check")
      this.showOrHide()
    },
    //弹出动画
    popp: function () {
      //main按钮顺时针旋转
      var animationMain = wx.createAnimation({
        duration: this.data.animTime,
        timingFunction: this.data.timingFunction_start
      })
      var animationMedicalhistory = wx.createAnimation({
        duration: this.data.animTime,
        timingFunction: this.data.timingFunction_start
      })
      var animationImg = wx.createAnimation({
        duration: this.data.animTime,
        timingFunction: this.data.timingFunction_start
      })

      var animationInspection = wx.createAnimation({
        duration: this.data.animTime,
        timingFunction: this.data.timingFunction_start
      })

      var animationCheck = wx.createAnimation({
        duration: this.data.animTime,
        timingFunction: this.data.timingFunction_start
      })

      var animationItem= wx.createAnimation({
        duration: this.data.animTime,
        timingFunction: this.data.timingFunction_start
      })


      animationMain.rotateZ(180).step();
      animationCheck.translate(-systemInfo.windowWidth /2, 0).step();
      animationInspection.translate(-systemInfo.windowWidth / 2.5, 0).step();
      animationMedicalhistory.translate(-systemInfo.windowWidth/3.5, 0).step();
      animationImg.translate(-systemInfo.windowWidth/6, 0).step();

      animationItem.translate(-systemInfo.windowWidth / 3, 0).width(systemInfo.windowWidth / 3).step();

      this.setData({
        animMain: animationMain.export(),
        animMedicalhistory: animationMedicalhistory.export(),
        animImg: animationImg.export(),
        animInspection: animationInspection.export(),
        animCheck: animationCheck.export(),
        animItem: animationItem.export(),



      })
    },
    //收回动画
    takeback: function () {
      //main按钮逆时针旋转
      var animationMain = wx.createAnimation({
        duration: this.data.animTime,
        timingFunction: this.data.timingFunction_end
      })
      var animationMedicalhistory = wx.createAnimation({
        duration: this.data.animTime,
        timingFunction: this.data.timingFunction_end
      })
      var animationImg = wx.createAnimation({
        duration: this.data.animTime,
        timingFunction: this.data.timingFunction_end
      })
      var animationInspection = wx.createAnimation({
        duration: this.data.animTime,
        timingFunction: this.data.timingFunction_end
      })
      var animationCheck = wx.createAnimation({
        duration: this.data.animTime,
        timingFunction: this.data.timingFunction_end
      })
      var animationItem = wx.createAnimation({
        duration: this.data.animTime,
        timingFunction: this.data.timingFunction_end
      })

      animationMain.rotateZ(0).step();
      animationCheck.translate(0, 0).rotateZ(0).step();
      animationInspection.translate(0, 0).rotateZ(0).step();
      animationMedicalhistory.translate(0, 0).rotateZ(0).step();
      animationImg.translate(0, 0).rotateZ(0).step();
      animationItem.translate(0, 0).width(-systemInfo.windowWidth).step();

      this.setData({
        animMain: animationMain.export(),
        animMedicalhistory: animationMedicalhistory.export(),
        animImg: animationImg.export(),
        animInspection: animationInspection.export(),
        animCheck: animationCheck.export(),
        animItem: animationItem.export(),

      })
    }
  },
  //解决滚动穿透问题
  myCatchTouch: function () {
    return
  }
})