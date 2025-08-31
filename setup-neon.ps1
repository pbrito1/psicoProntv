# Script PowerShell para configurar NeonDB - PsicoPront
# Execute este script como administrador se necessário

param(
    [string]$Environment = "dev"
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

# Verificar argumentos
if ($Environment -notin @("dev", "prod")) {
    Write-Error "Ambiente deve ser 'dev' ou 'prod'"
    Write-Error "Uso: .\setup-neon.ps1 [dev|prod]"
    exit 1
}

Write-Header "Configuração do NeonDB - PsicoPront"

# Verificar se Docker está rodando
Write-Info "Verificando Docker..."
try {
    docker info | Out-Null
    Write-Info "Docker está rodando"
} catch {
    Write-Error "Docker não está rodando. Inicie o Docker Desktop primeiro."
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Configurar ambiente
if ($Environment -eq "dev") {
    Write-Info "Configurando ambiente de desenvolvimento..."
    
    if (-not (Test-Path "backend\.env")) {
        if (Test-Path "backend\env.local.example") {
            Copy-Item "backend\env.local.example" "backend\.env"
            Write-Info "Arquivo .env criado para desenvolvimento"
        } else {
            Write-Warning "Arquivo env.local.example não encontrado"
        }
    }
    
    Write-Info "Ambiente de desenvolvimento configurado!"
    Write-Info "Para iniciar: docker-compose -f docker-compose.dev.yml up -d"
    
} else {
    Write-Info "Configurando ambiente de produção com NeonDB..."
    
    if (-not (Test-Path "backend\.env")) {
        if (Test-Path "backend\env.neon.windows.example") {
            Copy-Item "backend\env.neon.windows.example" "backend\.env"
            Write-Info "Arquivo .env criado para produção"
        } else {
            Write-Warning "Arquivo env.neon.windows.example não encontrado"
        }
    }
    
    Write-Warning "IMPORTANTE: Configure suas credenciais do NeonDB no arquivo backend\.env"
    Write-Info "1. Acesse https://neon.tech"
    Write-Info "2. Crie uma conta ou faça login"
    Write-Info "3. Crie um novo projeto"
    Write-Info "4. Copie a string de conexão"
    Write-Info "5. Cole no arquivo backend\.env na variável DATABASE_URL"
    
    $openNeon = Read-Host "Deseja abrir o NeonDB no navegador? (S/N)"
    if ($openNeon -eq "S" -or $openNeon -eq "s") {
        Start-Process "https://neon.tech"
    }
    
    Write-Info "Após configurar o .env, execute: docker-compose up -d"
}

Write-Info ""
Write-Info "Configuração concluída!"
Write-Info ""

if ($Environment -eq "dev") {
    Write-Info "Próximos passos:"
    Write-Info "1. Execute: docker-compose -f docker-compose.dev.yml up -d"
    Write-Info "2. Execute: docker-compose -f docker-compose.dev.yml exec backend npm run prisma:migrate"
    Write-Info "3. Execute: docker-compose -f docker-compose.dev.yml exec backend npm run prisma:seed"
    Write-Info "4. Acesse: http://localhost:3000"
} else {
    Write-Info "Próximos passos:"
    Write-Info "1. Configure suas credenciais do NeonDB no arquivo .env"
    Write-Info "2. Execute: docker-compose up -d"
    Write-Info "3. Execute: docker-compose exec backend npm run prisma:migrate"
    Write-Info "4. Acesse: http://localhost:3000"
}

Write-Info ""
Write-Info "Para mais informações, consulte o arquivo DOCKER_README.md"

Read-Host "Pressione Enter para sair"
