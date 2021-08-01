# 相册小程序

使用小程序云开发和百度云的 ai 接口做的一个相册小程序。


## 更新！！！
#### V2.0.3版本截图
<img src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-f8e0850c-4117-4be7-bc69-4d4c4ea2d930/81469b4b-77e9-402b-8ade-757aa6eb19db.jpg" alt="图片替换文本" width="160" height="360" align="bottom" /><img src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-f8e0850c-4117-4be7-bc69-4d4c4ea2d930/371a93c9-fc44-4106-8635-829f3d8f090d.jpg" alt="图片替换文本" width="160" height="360" align="bottom" /><img src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-f8e0850c-4117-4be7-bc69-4d4c4ea2d930/f69189ed-86a0-4c06-88b6-2ac77b0e13f6.jpg" alt="图片替换文本" width="160" height="360" align="bottom" /><img src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-f8e0850c-4117-4be7-bc69-4d4c4ea2d930/bd8c465a-f5d9-42fb-ae3e-be04d26077e3.jpg" alt="图片替换文本" width="160" height="360" align="bottom" /><img src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-f8e0850c-4117-4be7-bc69-4d4c4ea2d930/facd71ec-a40e-4bc8-a857-d204b5d036ba.jpg" alt="图片替换文本" width="160" height="360" align="bottom" /><img src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-f8e0850c-4117-4be7-bc69-4d4c4ea2d930/3c10f522-60c2-4ba4-ab9f-a00969d0c247.jpg" alt="图片替换文本" width="160" height="360" align="bottom" />

#### 体验
<img src="https://pcdn.wxiou.cn//20200909112453.jpg" alt="图片替换文本" width="200" height="200" align="bottom" />

#### V1.0.0版本截图
<img src="https://pcdn.wxiou.cn//20200909113101.jpg" alt="图片替换文本" width="180" height="360" align="bottom" /><img src="https://pcdn.wxiou.cn//20200909113132.jpg" alt="图片替换文本" width="180" height="360" align="bottom" /><img src="https://pcdn.wxiou.cn//20200909113157.jpg" alt="图片替换文本" width="180" height="360" align="bottom" /><img src="https://pcdn.wxiou.cn//20200909113313.jpg" alt="图片替换文本" width="180" height="360" align="bottom" /><img src="https://pcdn.wxiou.cn//20200909113339.jpg" alt="图片替换文本" width="180" height="360" align="bottom" />


## 🌺实现过程

使用 `wx.chooseImage` 选择图片，使用 `wx.cloud.uploadFile` 上传图片并获取到图片的 `fileID`，传给云函数`imgCheck`检测图片是否合规，如果合规，则上传图片，如果不合规，则拒绝上传图片。

这里考虑了两个问题：
* 图片过大
* 图片过多

图片过大：把图片放在临时文件夹，然后生成一个缩小的图片，得到缩小的图片，调用官方免费的审核接口`security.imgSecCheck`进行第一次的图片审核，在云函数`imgCheck`中使用的就是官方的图片审核接口，但是由于它有审核图片大小限制（1M）,所以在压缩完了的图片，判断一下它的大小，如果压缩过的图片小于限制，则调用官方接口审核，如果超过1M，则会调用百度云AI审核，百度云的限制在4M以内，目前百度云够用，未来会加入华为云的审核接口（10M）

图片过多：一次选取9张图片，只会审核第一张图片

云函数中获取到图片 https 协议的临时路径，把图片路径传给百度云审核接口，获取到信息后返回给前端。


审核过程：
* 1.图片大于0小于1M，采用压缩的方式，调用官方接口审核
* 2.图片大于1M小于4M，不压缩，直接调用百度云AI审核接口审核
* 3.图片大于4M小于10M，压缩后调用百度云AI接口审核
* 4.图片大于10M小于20M，直接上传不审核 （考虑压缩后接入华为云AI审核，华为云限制10M,压缩后应该可以审核，有空考虑考虑吧）
* 5.图片大于20M，直接不给上传，官方上传接口限制20M


## 🎁更新日志

#### v1.0.0
* 2020-06-07 完成图片展示页面的更新，美化（也不算很美）上传按钮
* 2020-07-19 接入原生官方审核接口完成（本地审核）
* 2020-07-23 新增”了解更多“页面

#### v1.2.0
* 2020-08-26 修改第一版中AK以及SK暴露在代码中引起的安全问题，修改为云环境端变量，进行传参
* 2020-08-26 原生官方接口在本地调用审核图片时，图片过小失真以至于违规图不能被识别的问题---解决方案：将审核过程放在云函数，新增云函数`imgCheck`
* 2020-08-28 图片超过官方限制不能审核的问题---解决方案：接入百度云AI审核，新增云函数`get_taken`，作用是获得百度云token供本地调用

#### v2.0.3
* 2021-07-26 重构页面布局，新增`AI智能处理模块`
* 2021-07-29 构建后端服务API并部署服务器
* 2021-07-31 本地调试，部署上线

## ⌛开发计划

* 将支持短视频存储......



## 🔨安装过程
#### 1、下载源码，并开通百度智能云API
- [百度智能云](https://cloud.baidu.com/)

注册百度智能云账号，选择图像审核，新建一个应用
![](https://pcdn.wxiou.cn//20200826132425.png)


这里的AK以及SK待会要用
![](https://pcdn.wxiou.cn//20200826132625.png)

#### 2、新建小程序，选择云开发
新建一个目录，新建一个云开发项目，然后它会初始化目录结构，初始化目录后，把下载的源码和新建的项目进行替换，因为直接导入的话可能没有用


#### 3、修改配置
点击云开发，新建一个环境，名称随意


新建以后可以得到云环境id
![](https://pcdn.wxiou.cn//20200909124622.png)

填入`app.js`文件
![](https://pcdn.wxiou.cn//20200909121430.png)

在数据库中新建集合，集合名为 photos；
![](https://pcdn.wxiou.cn//20200909122632.png)

在云开发控制设置存储的权限为 仅创建者可读写 ；确保只有上传的人可以读取图片；不然你的图片每个人都能看了


在存储中新建两个目录tmp-image 和 pics   这个cloud_icons不用管，我测试用的

![](https://pcdn.wxiou.cn//20200909122432.png)



检查当前是否连接了云开发环境
![](https://pcdn.wxiou.cn//20200909122725.png)

选择云函数目录，右键 选择`上传并部署：云端安装依赖`，全部云函数都需要部署一次


来到云开发环境，可以看到部署的云函数，点击版本管理
![](https://pcdn.wxiou.cn//20200909122837.png)

点击配置(不用在意云函数名称，我懒得截图了，用了老图)
![](https://pcdn.wxiou.cn//20200826135021.png)


添加两个环境变量
* clintId : 第一步的百度云API的AK
* clientSecret : 第一步的百度云API的SK
![](https://pcdn.wxiou.cn//20200826135148.png)


调试小程序，以上步骤没问题，便可正常运行

如有问题，请提issues


## 💰关于广告

* v1版本没有加入广告

* v2版本考虑加入广告


## 📭参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [百度云内容审核接口文档](https://ai.baidu.com/ai-doc/ANTIPORN/Jk3h6x8t2)


### 喜欢项目的请给个Star, 谢谢了！
