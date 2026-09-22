# 弯路地图 Detour

将 Git 提交和明确选择的 Codex JSONL 会话整理成待复核的决策节点，再导出为静态复盘页面。

## 本地运行

```powershell
python -m http.server 8080
# 打开 http://127.0.0.1:8080/projects/tools/detour/
```

## 扫描当前仓库

扫描器不会执行仓库脚本，也不会上传文件：

```powershell
node tools/detour.mjs --scan --repo . --out .detour/review.js
```

打开 Detour 页面，点击“导入扫描结果”选择 `.detour/review.js`，即可逐条复核、批准并导出。

可选导入一个明确选择且不超过 25 MB 的 Codex JSONL：

```powershell
node tools/detour.mjs --scan --repo . --codex path\to\session.jsonl --out .detour/review.js
```

可选 AI 只改写候选标题、原因和教训，不能批准公开内容或改变验证状态：

```powershell
$env:DEEPSEEK_API_KEY = "在本机安全设置，不要写入文件"
node tools/detour.mjs --scan --repo . --codex path\to\session.jsonl --ai --out .detour/review.js
```

生成的是候选节点，不是事实结论。发布前需要在本地复核，并将批准后的内容复制为公开报告。

## 验证

```powershell
node tools/detour.test.mjs
node tools/detour.browser.test.cjs
```

测试覆盖密钥、邮箱、手机号和本地用户路径脱敏，JSONL 信号识别、候选分类以及发布前 Secret 阻断。

## 隐私边界

- 原始会话和私有扫描结果不会提交到 Git。
- AI 不是核心依赖；当前版本不发送任何数据给模型。
- 公开报告只包含人工批准、再次脱敏后的摘要和证据说明。
