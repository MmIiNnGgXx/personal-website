# 真实数据连接

生产项目：`dnyzhfwqckrzragvrquv`  
测试项目：`njpxxwbiuwdfyyzuizea`

## 配置凭据

不要把凭据粘贴到聊天、代码或 Git。请在仓库根目录运行：

```powershell
.\scripts\set-integration-secrets.ps1
```

脚本会隐藏输入并写入 production。测试环境使用：

```powershell
.\scripts\set-integration-secrets.ps1 -ProjectRef njpxxwbiuwdfyyzuizea
```

## 权限

- Google 服务账号必须启用 Analytics Data API，并在对应 GA4 Property 中获得 Viewer 权限。
- Shopify 自定义应用只授予 `read_products`、`read_inventory`、`read_orders`、`read_customers`。
- DeepSeek Key 只存放在 Supabase Edge Function Secrets。

## 验收

1. 页面使用邮箱验证码登录。
2. 简历诊断上传真实 PDF/DOCX 并粘贴真实 JD。
3. 数据分析点击“同步 GA4”，对照 GA4 相同日期范围。
4. 商品运营点击“同步 Shopify”，抽查商品、库存、订单和客户。
5. Shopify 页面不提供任何写入商店的操作。
