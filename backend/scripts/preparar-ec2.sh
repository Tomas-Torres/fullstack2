#!/usr/bin/env bash
# ============================================================
# Level-Up Gamer - Preparacion de una instancia EC2 (Amazon Linux 2023)
# ============================================================
# Ejecutar una sola vez, con permisos de root:
#   sudo bash scripts/preparar-ec2.sh
#
# Deja la instancia lista para el compose de produccion:
#   - 1 GB de swap (la t3.micro tiene 1 GB de RAM)
#   - Docker Engine y el plugin docker compose
# ============================================================
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Ejecutar con sudo: sudo bash scripts/preparar-ec2.sh" >&2
  exit 1
fi

echo "==> Actualizando paquetes"
dnf install -y dnf-plugins-core
dnf update -y

echo "==> Instalando Docker Engine"
dnf install -y docker
systemctl enable --now docker

echo "==> Instalando plugin docker compose"
COMPOSE_VERSION="v2.32.4"
mkdir -p /usr/libexec/docker/cli-plugins
curl -fsSL \
  "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o /usr/libexec/docker/cli-plugins/docker-compose
chmod +x /usr/libexec/docker/cli-plugins/docker-compose

echo "==> Agregando al usuario ec2-user al grupo docker"
usermod -aG docker ec2-user || true

echo "==> Configurando swap de 1 GB"
if swapon --show | grep -q '/swapfile'; then
  echo "    El swap ya estaba configurado"
else
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Ajustando el sistema para poca memoria"
sysctl -w vm.swappiness=20
grep -q '^vm.swappiness' /etc/sysctl.conf || echo 'vm.swappiness=20' >> /etc/sysctl.conf

echo
echo "Listo. Estado actual:"
free -h
docker --version
docker compose version
echo
echo "Cerrar y volver a abrir la sesion SSH para usar docker sin sudo."
