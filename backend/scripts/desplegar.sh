#!/usr/bin/env bash
# ============================================================
# Level-Up Gamer - Despliegue de los cuatro microservicios + frontend
# ============================================================
# Ejecutar desde la carpeta backend/ de la instancia:
#   bash scripts/desplegar.sh
#
# Requisitos:
#   - Docker y docker compose instalados (ver preparar-ec2.sh)
#   - Archivo .env con PUBLIC_HOST, MYSQL_ROOT_PASSWORD, JWT_SECRET, etc.
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "ERROR: falta el archivo .env. Copiar .env.prod.example y completarlo:" >&2
  echo "  cp .env.prod.example .env" >&2
  exit 1
fi

# Carga las variables para construir las URLs de verificacion.
set -a
# shellcheck disable=SC1091
. ./.env
set +a

: "${PUBLIC_HOST:?Definir PUBLIC_HOST en .env}"

echo "==> Construyendo imagenes (esto puede tardar varios minutos en la t3.micro)"
docker compose -f docker-compose.prod.yml build

echo "==> Levantando servicios"
docker compose -f docker-compose.prod.yml up -d

echo "==> Esperando a que la base de datos y los servicios esten sanos"
for intento in $(seq 1 40); do
  SFS=$(docker compose -f docker-compose.prod.yml ps --format json 2>/dev/null || true)
  NO_SANOS=$(echo "$SFS" | grep -c '"Health":"starting"' || true)
  echo "    intento ${intento}: servicios aun iniciando = ${NO_SANOS}"
  if [ "${NO_SANOS}" -eq 0 ]; then
    break
  fi
  sleep 10
done

echo "==> Verificando health de los microservicios"
FALLOS=0
for puerto in 8081 8082 8083 8085; do
  if curl -fsS "http://127.0.0.1:${puerto}/actuator/health" | grep -q '"UP"'; then
    echo "    OK  http://${PUBLIC_HOST}:${puerto}/actuator/health"
  else
    echo "    FALLO puerto ${puerto}" >&2
    FALLOS=$((FALLOS + 1))
  fi
done

if [ "${FALLOS}" -gt 0 ]; then
  echo "Revisar logs con: docker compose -f docker-compose.prod.yml logs --tail=100" >&2
  exit 1
fi

echo
echo "Despliegue completado."
echo "  Tienda:  http://${PUBLIC_HOST}/"
echo "  Swagger: http://${PUBLIC_HOST}:8081/swagger-ui.html (y demas puertos)"
