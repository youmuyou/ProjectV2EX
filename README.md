## Project V2EX

V2EX的非官方小程序，更舒服的浏览（摸鱼）体验。

在实现了基本的功能基础上优化了一些使用体验，如可以查看评论的对话列表、更方便地收藏点赞、更及时地收到通知提醒（体现在tabbar的通知图标上，有未读通知数显示），有问题欢迎提issues。

微信小程序搜索：Project V2EX或扫描下方小程序码

![v2ex](https://github.com/thelittlepandaisbehind/ProjectV2EX/raw/master/v2ex.jpg)

## 已实现的基础功能

1. 最新主题列表
2. 今日热议主题列表
3. 最近的主题列表（需要登录）
4. 消息通知
5. 创建新主题
6. 回复评论

## 声明

登录时会将您的用户名密码明文传输到我的服务器去处理，但是并不会保存！因为小程序的wx.request API不提供http 302状态的返回处理，登录时如果直接用小程序去post V2EX是无法获取到正确的cookie的，所以要经过我的服务器中转获得。服务器的处理代码请看：[/src/web/v2exlogin.php](https://github.com/thelittlepandaisbehind/ProjectV2EX/blob/master/src/web/v2exlogin.php)。除了登录所需要的中转请求接口外，其他的功能都是直接使用V2EX的，请放心使用。