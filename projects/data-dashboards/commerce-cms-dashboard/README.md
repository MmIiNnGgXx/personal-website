# 商品运营后台

中文优先的可交互前端作品，英文仅作辅助标题。

[在线体验](https://mmiinnggxx.github.io/personal-website/commerce-cms-dashboard/)

## 已实现

通过 Shopify Admin GraphQL API 2026-07 只读同步商品、库存、订单和客户，并展示同步时间、筛选和库存预警。

## 技术与运行

HTML、CSS、原生 JavaScript。直接打开 index.html，或通过 GitHub Pages 访问。无安装与构建步骤。

## 当前边界

没有 Shopify 凭据或未登录时显示空状态，不生成示例数据。当前仅申请读取权限，页面不会修改商品、库存、订单或履约状态。

## 验证

在原工作区通过 Playwright 验证 1440px 桌面与 390px 手机布局、核心交互及控制台错误。

[优化说明与验收方法](../docs/UI_OPTIMIZATION_GUIDE.md)
