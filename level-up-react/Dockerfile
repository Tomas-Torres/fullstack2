# ---------- Etapa 1: compilacion ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Las URLs se inyectan en tiempo de compilacion porque Vite las reemplaza.
ARG VITE_API_LOGIN=http://localhost:8081
ARG VITE_API_PRODUCTOS=http://localhost:8082
ARG VITE_API_CARRITO=http://localhost:8083
ARG VITE_API_PAGOS=http://localhost:8085
ENV VITE_API_LOGIN=$VITE_API_LOGIN \
    VITE_API_PRODUCTOS=$VITE_API_PRODUCTOS \
    VITE_API_CARRITO=$VITE_API_CARRITO \
    VITE_API_PAGOS=$VITE_API_PAGOS

RUN npm run build

# ---------- Etapa 2: servidor estatico ----------
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
