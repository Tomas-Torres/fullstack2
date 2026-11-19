# Guía de despliegue en EC2 — Level-Up Gamer

Esta guía es la adaptación de la guía del laboratorio **"Desplegar microservicios Spring Boot en Amazon EC2 con Docker"** a nuestro proyecto. La diferencia principal es que **no necesitas la llave `.pem`**: te conectas desde la consola de AWS con **Session Manager**.

## Datos de la instancia

| Dato | Valor |
|---|---|
| IP pública (Elastic IP) | `184.72.249.146` |
| DNS público | `ec2-184-72-249-146.compute-1.amazonaws.com` |
| ID de instancia | `i-04326bb1981f50f07` |
| Región | `us-east-1` |
| Sistema | Amazon Linux 2023 |
| Tipo | `t3.micro` |

La URL pública de la demo será:

```text
http://184.72.249.146/
```

---

## 1. Configurar AWS

### 1.1 Security Group

Asociar a la instancia `i-04326bb1981f50f07` este **Inbound**:

| Tipo | Puerto | Origen | Observación |
|---|---:|---|---|
| HTTP | 80 | `0.0.0.0/0` | Frontend Nginx |
| Custom TCP | 8081 | `0.0.0.0/0` | `ms-login` |
| Custom TCP | 8082 | `0.0.0.0/0` | `ms-productos` |
| Custom TCP | 8083 | `0.0.0.0/0` | `ms-carrito` |
| Custom TCP | 8085 | `0.0.0.0/0` | `ms-pagos` |
| SSH | 22 | My IP | Opcional; Session Manager no lo necesita |
| MySQL | 3306 | — | **No abrir** |

### 1.2 Rol IAM para Session Manager

La instancia debe tener un **IAM Instance Profile** con la política:

```text
AmazonSSMManagedInstanceCore
```

Con eso puedes entrar por **EC2 → Instancia → Connect → Session Manager** sin llave privada.

### 1.3 Conectarse

En la consola de AWS:

```text
EC2 → Instances → i-04326bb1981f50f07 → Connect → Session Manager → Connect
```

Verificas que estás dentro:

```bash
whoami
# ssm-user (o ec2-user)
```

---

## 2. Instalar Docker, Compose y Git

Amazon Linux 2023 ya trae el agente SSM. Instala lo demás:

```bash
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL "https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

Cierra la sesión de Session Manager y vuelve a entrar para que el grupo `docker` surta efecto:

```bash
exit
```

Verifica:

```bash
docker --version
docker compose version
docker ps
```

> Si la instancia tiene solo 1 GB de RAM, el repo incluye `backend/scripts/preparar-ec2.sh`, que además crea un swap de 1 GB. Puedes ejecutarlo después de clonar.

---

## 3. Clonar y configurar

```bash
cd ~
git clone https://github.com/Tomas-Torres/fullstack2.git
cd fullstack2
cp .env.example .env
nano .env
```

El `.env.example` ya viene con:

```text
PUBLIC_HOST=184.72.249.146
CORS_ORIGINS=http://184.72.249.146,http://localhost,http://127.0.0.1
```

Si tu IP cambió, edita solo `PUBLIC_HOST` y `CORS_ORIGINS`. **No uses `localhost`**: el frontend compila las URLs de los microservicios dentro del bundle.

---

## 4. Preparar la instancia (swap + Docker)

```bash
sudo bash backend/scripts/preparar-ec2.sh
```

Si ya instalaste Docker arriba, el script solo completa lo que falte. Después vuelve a entrar a Session Manager.

---

## 5. Levantar el stack

Desde la **raíz** del repositorio:

```bash
docker compose up -d --build
```

Revisa el estado:

```bash
docker compose ps
docker compose logs -f
```

Los seis contenedores deben quedar `Up`:

```text
levelup-mysql
levelup-ms-login
levelup-ms-productos
levelup-ms-carrito
levelup-ms-pagos
levelup-frontend
```

---

## 6. Verificar

### 6.1 Health

```bash
for p in 8081 8082 8083 8085; do
  echo "== $p =="
  curl -s http://localhost:$p/actuator/health
  echo
done
```

Cada uno debe responder:

```json
{"status":"UP"}
```

### 6.2 Desde tu navegador

```text
http://184.72.249.146/                      → tienda (frontend)
http://184.72.249.146:8081/actuator/health  → UP
http://184.72.249.146:8082/actuator/health  → UP
http://184.72.249.146:8083/actuator/health  → UP
http://184.72.249.146:8085/actuator/health  → UP
```

### 6.3 Cuentas para copiar y pegar

```text
===== ADMIN =====
Correo: admin@levelup.cl
Clave:  Admin123!
Rol:    ADMIN

===== CLIENTE NORMAL =====
Correo: cliente.pagos@levelup.cl
Clave:  Cliente123!
Rol:    CLIENTE
```

Ambas se crean automáticamente al iniciar `ms-login`, incluso en un volumen MySQL vacío.

### 6.4 Flujo de prueba rápido

1. Iniciar sesión con el admin.
2. Crear un producto (CRUD protegido por rol).
3. Cerrar sesión y entrar con el cliente.
4. Agregar producto al carrito.
5. Aplicar cupón `LEVELUP10`.
6. Pagar con tarjeta terminada en `4444` → `APROBADO`.

---

## 7. Actualizar después de un cambio

```bash
cd ~/fullstack2
git pull
docker compose up -d --build
```

## 8. Comandos útiles

| Acción | Comando |
|---|---|
| Ver contenedores | `docker compose ps` |
| Ver logs de un servicio | `docker compose logs -f ms-login` |
| Reiniciar un servicio | `docker compose restart ms-login` |
| Bajar todo | `docker compose down` |
| Bajar y borrar volúmenes | `docker compose down -v` **(cuidado: borra la BD)** |
| Uso de CPU/RAM | `docker stats` |
| Limpiar imágenes viejas | `docker system prune -af` |

## 9. Problemas frecuentes

| Síntoma | Solución |
|---|---|
| `Cannot connect to the Docker daemon` | `sudo systemctl start docker` y vuelve a entrar a Session Manager |
| Contenedor en reinicio loop | `docker compose logs <servicio>` |
| `Connection refused` desde el navegador | Revisa el Security Group y que `PUBLIC_HOST` sea la IP correcta |
| MySQL no conecta | La URL JDBC usa `mysql:3306`, nunca `localhost` |
| Build muy lento / OOM |usa `docker system prune -af` y recuerda el swap de 1 GB |
| Frontend carga pero las APIs fallan | El bundle se compiló con otra IP: edita `.env` y vuelve a hacer `docker compose up -d --build` |

---

## Checklist de entrega

- [x] `Dockerfile` en los 4 microservicios.
- [x] `docker-compose.yml` en la raíz y probado en local.
- [x] Repositorio en GitHub con todos los archivos.
- [ ] Docker + Compose instalados en la EC2.
- [ ] `docker compose up -d --build` ejecutado sin errores.
- [ ] Contenedores `Up`.
- [ ] Health de los cuatro servicios respondiendo `UP`.
- [ ] Login con admin y con cliente desde `http://184.72.249.146/`.
