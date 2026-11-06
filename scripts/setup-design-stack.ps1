<#
.SYNOPSIS
Instala skills de design e ferramentas no computador que executa este script.
.DESCRIPTION
Rode em PowerShell no diretório raiz do LUPA, com Node 22+.
Inspecione os repositórios de origem antes de executar npx/npm.
Não altera Vercel, Supabase, SQL ou serviços de produção.
#>
param([ValidateSet("codex","cursor","claude-code")][string]$Agent="codex")
$ErrorActionPreference="Stop"
$env:DISABLE_TELEMETRY="1"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js 22+ é necessário." }
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) { throw "npx não encontrado." }
$major=[int]((node --version).TrimStart("v").Split(".")[0])
if ($major -lt 22) { throw "Instale Node.js 22+ antes de continuar." }

Write-Host "01/06 TASTE: instalar design-taste-frontend (uma única fonte, Leonxlnx)." -ForegroundColor Cyan
& npx --yes skills add Leonxlnx/taste-skill --skill design-taste-frontend -a $Agent -y
if ($LASTEXITCODE -ne 0) { throw "Falha na instalação taste." }

Write-Host "02/06 EMIL + IMPECCABLE: engenharia de interação e crítica de UI." -ForegroundColor Cyan
& npx --yes skills add emilkowalski/skills --skill emil-design-eng -a $Agent -y
if ($LASTEXITCODE -ne 0) { throw "Falha Emil." }
& npx --yes skills add pbakaus/impeccable --skill impeccable -a $Agent -y
if ($LASTEXITCODE -ne 0) { throw "Falha Impeccable." }

Write-Host "03/06 DESIGN-TASTE + GRILLING: crítica do fluxo e decisões." -ForegroundColor Cyan
& npx --yes skills add mattpocock/skills --skill grilling -a $Agent -y
if ($LASTEXITCODE -ne 0) { throw "Falha Grilling." }

Write-Host "04/06 AGENT-BROWSER + PLAYWRIGHT MCP: ferramentas de navegação." -ForegroundColor Cyan
& npx --yes skills add vercel-labs/agent-browser -a $Agent -y
if ($LASTEXITCODE -ne 0) { throw "Falha skill agent-browser." }
& npm install --global agent-browser
if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar agent-browser." }
& agent-browser install
if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar navegador agent-browser." }
# O Playwright MCP é um servidor sob demanda; configuração está em .vscode/mcp.json.
# Ele só estará conectado após você iniciar/autorizar o servidor no VS Code.
Write-Host "Playwright MCP configurado em .vscode/mcp.json (ainda requer ativação no VS Code)."

Write-Host "05/06 COPYWRITING + HUMANIZAR: textos em PT-BR sem promessas clínicas." -ForegroundColor Cyan
& npx --yes skills add coreyhaines31/marketingskills --skill copywriting -a $Agent -y
if ($LASTEXITCODE -ne 0) { throw "Falha Copywriting." }
& npx --yes skills add fabricioctelles/skills --skill humanizar -a $Agent -y
if ($LASTEXITCODE -ne 0) { throw "Falha Humanizar." }

Write-Host "06/06 GRAPHIFY-LABS: conhecimento estrutural do código e documentação." -ForegroundColor Cyan
if (Get-Command uv -ErrorAction SilentlyContinue) {
  & uv tool install "graphifyy[mcp]"
  if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar graphifyy via uv." }
} elseif (Get-Command pipx -ErrorAction SilentlyContinue) {
  & pipx install "graphifyy[mcp]"
  if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar graphifyy via pipx." }
} else {
  Write-Warning "uv/pipx não encontrados. Rode: winget install astral-sh.uv; depois uv tool install 'graphifyy[mcp]'."
}
if (Get-Command graphify -ErrorAction SilentlyContinue) {
  & graphify install --project --platform $Agent
  if ($LASTEXITCODE -ne 0) { throw "Falha ao registrar skill Graphify." }
  $env:GRAPHIFY_BACKEND='none'
  & graphify . --code-only
  if ($LASTEXITCODE -ne 0) { throw "Falha ao gerar knowledge graph." }
  Write-Host "Mapa estrutural de codigo em graphify-out/; documentos exigem backend semantico autorizado." -ForegroundColor Green
}
Write-Host "Fim. Reinicie o agente no VS Code e inicie o MCP do Playwright quando solicitado." -ForegroundColor Green
