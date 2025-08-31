# Script PowerShell para migrar do SQLite para NeonDB - PsicoPront
# Execute este script como administrador se necessário

param(
    [string]$Environment = "prod"
)

# Configurar cores para output
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Red = "`e[31m"
$Reset = "`e[0m"

# Função para imprimir mensagens coloridas
function Write-Info {
    param([string]$Message)
    Write-Host "$Green[INFO]$Reset $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "$Yellow[WARNING]$Reset $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "$Red[ERROR]$Reset $Message" -ForegroundColor Red
}

function Write-Header {
    param([string]$Message)
    Write-Host "$Blue================================$Reset" -ForegroundColor Blue
    Write-Host "$Blue  $Message$Reset" -ForegroundColor Blue
    Write-Host "$Blue================================$Reset" -ForegroundColor Blue
}

Write-Header "Migração do SQLite para NeonDB - PsicoPront"

# Verificar se estamos no diretório correto
if (-not (Test-Path "backend")) {
    Write-Error "Execute este script no diretório raiz do projeto"
    exit 1
}

# Verificar se o arquivo .env existe
if (-not (Test-Path "backend\.env")) {
    Write-Error "Arquivo .env não encontrado. Execute setup-neon.ps1 primeiro."
    exit 1
}

# Verificar se DATABASE_URL está configurado
$envContent = Get-Content "backend\.env" -Raw
if ($envContent -notmatch "DATABASE_URL.*neon\.tech") {
    Write-Error "DATABASE_URL não está configurado para NeonDB. Configure primeiro."
    exit 1
}

Write-Info "Configuração verificada. Iniciando migração..."

# Navegar para o diretório backend
Set-Location "backend"

try {
    # Gerar cliente Prisma
    Write-Info "Gerando cliente Prisma..."
    npx prisma generate
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Erro ao gerar cliente Prisma"
        exit 1
    }
    
    # Executar migrações
    Write-Info "Executando migrações..."
    npx prisma migrate deploy
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Erro ao executar migrações"
        exit 1
    }
    
    # Executar seed
    Write-Info "Executando seed..."
    npx prisma db seed
    
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Seed falhou, mas pode não ser crítico"
    }
    
    Write-Info "Migração concluída com sucesso!"
    Write-Info ""
    Write-Info "Próximos passos:"
    Write-Info "1. Inicie o backend: npm run start:dev"
    Write-Info "2. Teste a API: http://localhost:3000/docs"
    Write-Info "3. Verifique o banco: npx prisma studio"
    
} catch {
    Write-Error "Erro durante a migração: $_"
    exit 1
} finally {
    # Voltar para o diretório raiz
    Set-Location ".."
}

Write-Info ""
Write-Info "Migração concluída!"
Read-Host "Pressione Enter para sair"
