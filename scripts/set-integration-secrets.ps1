param([string]$ProjectRef = "dnyzhfwqckrzragvrquv")
$ErrorActionPreference = "Stop"
function Read-Secret([string]$Prompt) {
  $secure = Read-Host $Prompt -AsSecureString
  [Net.NetworkCredential]::new("", $secure).Password
}
$deepseek = Read-Secret "DeepSeek API Key"
$ga4Property = Read-Host "GA4 Property ID（仅数字）"
$googleJson = Read-Secret "Google Service Account JSON（单行 JSON）"
$shopifyDomain = Read-Host "Shopify 域名（example.myshopify.com）"
$shopifyToken = Read-Secret "Shopify Admin Access Token（只读权限）"
if ($ga4Property -notmatch '^\d+$') { throw "GA4 Property ID 必须为数字" }
if ($shopifyDomain -notmatch '^[a-zA-Z0-9-]+\.myshopify\.com$') { throw "Shopify 域名格式无效" }
npx --yes supabase@latest secrets set "DEEPSEEK_API_KEY=$deepseek" "DEEPSEEK_MODEL=deepseek-flash" "GA4_PROPERTY_ID=$ga4Property" "GOOGLE_SERVICE_ACCOUNT_JSON=$googleJson" "SHOPIFY_STORE_DOMAIN=$shopifyDomain" "SHOPIFY_ADMIN_ACCESS_TOKEN=$shopifyToken" --project-ref $ProjectRef
if ($LASTEXITCODE -ne 0) { throw "Supabase Secrets 写入失败" }
Write-Host "Secrets 已安全写入 $ProjectRef；脚本未保存或输出密钥。"
