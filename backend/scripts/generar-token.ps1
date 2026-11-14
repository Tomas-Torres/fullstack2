# Genera un JWT HS256 compatible con los microservicios de Level-Up Gamer.
# Sirve para probar ms-productos (y los demas servicios) antes de que ms-login
# entregue tokens reales. El secreto debe coincidir con JWT_SECRET del backend.
#
# Ejemplos:
#   .\generar-token.ps1
#   .\generar-token.ps1 -Rol CLIENTE -Subject cliente@levelup.cl
#   .\generar-token.ps1 -Rol ADMIN -Horas 8
#   $token = .\generar-token.ps1 -Rol ADMIN

param(
    [ValidateSet("ADMIN", "CLIENTE")]
    [string]$Rol = "ADMIN",

    [string]$Subject = "admin@levelup.cl",

    [int]$Horas = 2,

    [string]$Secret = "levelup-gamer-dev-secret-key-change-in-production-2026"
)

function ConvertTo-Base64Url {
    param([byte[]]$Bytes)
    return [Convert]::ToBase64String($Bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

$header = @{ alg = "HS256"; typ = "JWT" } | ConvertTo-Json -Compress
$ahora = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$payload = @{
    sub = $Subject
    rol = $Rol
    iat = $ahora
    exp = $ahora + ($Horas * 3600)
} | ConvertTo-Json -Compress

$headerB64 = ConvertTo-Base64Url ([Text.Encoding]::UTF8.GetBytes($header))
$payloadB64 = ConvertTo-Base64Url ([Text.Encoding]::UTF8.GetBytes($payload))
$entradaFirma = "$headerB64.$payloadB64"

$hmac = New-Object System.Security.Cryptography.HMACSHA256
$hmac.Key = [Text.Encoding]::UTF8.GetBytes($Secret)
$firma = ConvertTo-Base64Url ($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($entradaFirma)))

Write-Output "$entradaFirma.$firma"
