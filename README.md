## Project V2EX

V2EX的非官方小程序，更舒服的浏览（摸鱼）体验。

在实现了基本的功能基础上优化了一些使用体验，如可以查看评论的对话列表、更方便地收藏点赞、更及时地收到通知提醒（体现在tabbar的通知图标上，有未读通知数显示），有问题欢迎提issues。

微信小程序搜索：Project V2EX或扫描下方小程序码

![v2ex](https://github.com/thelittlepandaisbehind/ProjectV2EX/raw/master/v2ex.jpg)

## 已实现的基础功能

1. 最新主题列表
2. 今日热议主题列表
3. 最近的主题列表
4. 消息通知
5. 创建新主题
6. 查看、回复评论
7. 点赞主题、评论
8. 收藏主题
9. 查看我收藏的主题

## 声明

登录时会将您的用户名密码明文传输到我的服务器去处理，但是并不会保存！因为小程序的wx.request API不提供http 302状态的返回处理，登录时如果直接用小程序去post V2EX是无法获取到正确的cookie的，所以要经过我的服务器中转获得。服务器的处理代码请看：[/src/web/v2exlogin.php](https://github.com/thelittlepandaisbehind/ProjectV2EX/blob/master/src/web/v2exlogin.php)。除了登录所需要的中转请求接口外，其他的功能都是直接使用V2EX的，请放心使用。

## 已知的BUG

1. 登录时获取验证码有概率失败，解决方案：尝试多次（点击验证码位置可以刷新验证码）。
2. 回复评论时有概率第一次失败，解决方案：重新提交即可。
3. 复制评论时没有处理html代码，解决方案：无。