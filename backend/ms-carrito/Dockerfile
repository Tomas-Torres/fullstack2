# syntax=docker/dockerfile:1
# Imagen de ms-carrito. Se construye desde la raiz con:
#   docker compose up -d --build
# (contexto de build: ./backend, dockerfile: ms-carrito/Dockerfile)
ARG MODULO=ms-carrito

# ---------- Etapa 1: compilacion ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Se copia el reactor completo porque los modulos heredan del pom padre y
# pueden depender del modulo comun.
COPY pom.xml ./
COPY .mvn .mvn
COPY mvnw mvnw
COPY comun comun
COPY ms-login ms-login
COPY ms-productos ms-productos
COPY ms-carrito ms-carrito
COPY ms-pagos ms-pagos

ARG MODULO
RUN mvn -B -q -pl "${MODULO}" -am -DskipTests package \
    && cp "${MODULO}/target/${MODULO}-1.0.0.jar" /build/app.jar

# ---------- Etapa 2: ejecucion ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S levelup && adduser -S levelup -G levelup

COPY --from=build /build/app.jar /app/app.jar
RUN chown -R levelup:levelup /app
USER levelup

# Limites pensados para una sola instancia t3.micro (1 GB de RAM + swap).
# Spring Boot 4 + Hibernate necesitan mas MetaSpace del que parece: con 96 MB
# se produce OutOfMemoryError durante el arranque. Se reserva 160 MB y se
# compensa bajando el heap y desactivando la compilacion JIT completa.
ENV JAVA_OPTS="-Xms48m -Xmx112m -XX:MaxMetaspaceSize=160m -XX:ReservedCodeCacheSize=32m -XX:+UseSerialGC -XX:TieredStopAtLevel=1 -Xss512k -Dfile.encoding=UTF-8"

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
