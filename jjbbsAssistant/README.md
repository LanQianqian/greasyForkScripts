# 兔区&闲情助手

> [旧版(2018.9.4)](https://greasyfork.org/zh-CN/scripts/371889) 已失效，会自动链接到 [新版(2021.11.25)](https://greasyfork.org/zh-CN/scripts/436030)

## 安装

### PC端

- 使用Chrome或Firefox浏览器，安装Tampermonkey扩展
- 访问 [脚本](https://greasyfork.org/zh-CN/scripts/436030) 页面，点击"安装"

### iOS端

- 使用Alook浏览器
- 设置-自定义设置-JavaScript扩展-右上角"+"-被动扩展
- 名称: 兔区&闲情助手; 匹配类型: 域名; 匹配值: *
- JavaScript代码如下

```JavaScript
$(function () {
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://greasyfork.org/scripts/436030-%E5%85%94%E5%8C%BA-%E9%97%B2%E6%83%85%E5%8A%A9%E6%89%8B/code/%E5%85%94%E5%8C%BA%E9%97%B2%E6%83%85%E5%8A%A9%E6%89%8B.user.js';
    document.head.appendChild(script);
});
```

### 安卓端

- 使用X浏览器或Via浏览器
- 访问 [脚本](https://greasyfork.org/zh-CN/scripts/436030) 页面，按如下步骤安装
- 如果网页提示"您需要一个脚本管理器"，点击"我已有脚本管理器，让我安装！"
- 注意：安卓端可能不会自动检查脚本更新，如需获取更新可重新访问 [脚本](https://greasyfork.org/zh-CN/scripts/436030) 页面，安装最新版(同时注意删除/覆盖旧版，防止脚本重复运行)

#### X浏览器

- 点击浏览器底端的"安装"按钮

#### Via浏览器

- 在浏览器弹出页面中，"站点"填写为*，然后点击"安装"按钮

## 使用

- 安装完成后，访问兔区或闲情等晋江论坛时，会自动换肤，且右上角显示助手工具栏
