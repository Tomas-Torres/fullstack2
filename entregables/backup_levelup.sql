-- MySQL dump 10.13  Distrib 8.4.13, for Linux (x86_64)
--
-- Host: localhost    Database: db_login
-- ------------------------------------------------------
-- Server version	8.4.13

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `db_login`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `db_login` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `db_login`;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `activo` bit(1) NOT NULL,
  `comuna` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_registro` datetime(6) NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `region` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('ADMIN','CLIENTE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKcdmw5hxlfj78uf4997i3qyyw5` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,_binary '','Santiago','admin@levelup.cl','2026-11-19 00:24:38.717374','Administrador','$2a$10$qy5rnBaJco/bnpI.BK2.k.4LfjjpNQ/sxbWeMR.zcFnmRDjMyG1gq','metropolitana','ADMIN',NULL),(2,_binary '','Santiago','verificacion20261118213115@levelup.cl','2026-11-19 00:31:15.403288','Verificacion Final','$2a$10$fmHH6QIj/zluZ0JL0TO6JuSiigfaD7tkz9umD6.OyPmCvM4puPDd6','metropolitana','CLIENTE','912345678'),(3,_binary '','Santiago','cliente.pagos@levelup.cl','2026-11-19 02:09:30.181910','Cliente Pagos','$2a$10$ZKzuvlA3VyCLYNIXExzUj.5E/p3kZw2iH4jpXVBOLNMIJTwZgT6i2','metropolitana','CLIENTE',NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'db_login'
--

--
-- Current Database: `db_productos`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `db_productos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `db_productos`;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categorias_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (2,'Accesorios'),(4,'Computadores Gamers'),(1,'Juegos de Mesa'),(6,'Mouse'),(5,'Sillas Gamers'),(3,'Videojuegos');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `activo` bit(1) NOT NULL,
  `atributo` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descuento` int NOT NULL,
  `imagen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio` int NOT NULL,
  `stock` int NOT NULL,
  `categoria_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2fwq10nwymfv7fumctxt9vpgb` (`categoria_id`),
  CONSTRAINT `FK2fwq10nwymfv7fumctxt9vpgb` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,_binary '','3-4 jugadores',0,'/img/catan.png','Catan',29990,10,1),(2,_binary '','2-5 jugadores',15,'/img/Carcassonne.webp','Carcassonne',24990,10,1),(3,_binary '','Inalámbrico',0,'/img/control_xbox.png','Controlador Xbox Series X',59990,10,2),(4,_binary '','Micrófono desmontable',20,'/img/Audífonos_HyperX_Cloud_II.jpg','Audífonos HyperX Cloud II',79990,10,2),(5,_binary '','Sin lector de discos',0,'/img/gta_6.webp','GTA6 (Versión Digital)',429990,0,3),(6,_binary '','Alto rendimiento',0,'/img/PC_Gamer_ASUS_ROG_Strix.png','PC Gamer ASUS ROG Strix',1299990,5,4),(7,_binary '','Soporte ergonómico',0,'/img/Silla_Gamer_Secretlab_Titan.webp','Silla Gamer Secretlab Titan',349990,5,5),(8,_binary '','Sensor de alta precisión',10,'/img/Mouse_Logitech_G502_HERO.png','Mouse Logitech G502 HERO',49990,10,6);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'db_productos'
--

--
-- Current Database: `db_carrito`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `db_carrito` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `db_carrito`;

--
-- Table structure for table `carritos`
--

DROP TABLE IF EXISTS `carritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carritos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cupon_codigo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_carritos_usuario` (`usuario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carritos`
--

LOCK TABLES `carritos` WRITE;
/*!40000 ALTER TABLE `carritos` DISABLE KEYS */;
INSERT INTO `carritos` VALUES (1,'LEVELUP10','2026-11-19 00:31:16.213923',2),(2,'LEVELUP10','2026-11-19 02:13:43.526861',3);
/*!40000 ALTER TABLE `carritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items_carrito`
--

DROP TABLE IF EXISTS `items_carrito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items_carrito` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cantidad` int NOT NULL,
  `imagen` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio_unitario` int NOT NULL,
  `producto_id` bigint NOT NULL,
  `carrito_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_items_carrito_producto` (`carrito_id`,`producto_id`),
  CONSTRAINT `FK9qal2jfqtv8ek5uelns6o4cn1` FOREIGN KEY (`carrito_id`) REFERENCES `carritos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items_carrito`
--

LOCK TABLES `items_carrito` WRITE;
/*!40000 ALTER TABLE `items_carrito` DISABLE KEYS */;
INSERT INTO `items_carrito` VALUES (1,1,'/img/catan.png','Catan',29990,1,1),(3,1,'/img/catan.png','Catan',29990,1,2);
/*!40000 ALTER TABLE `items_carrito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'db_carrito'
--

--
-- Current Database: `db_pagos`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `db_pagos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `db_pagos`;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `codigo_transaccion` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('APROBADO','RECHAZADO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` datetime(6) NOT NULL,
  `metodo` enum('TARJETA_CREDITO','TARJETA_DEBITO','TRANSFERENCIA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto` int NOT NULL,
  `motivo_rechazo` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden_id` bigint NOT NULL,
  `ultimos_digitos` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK2ntbia3wlj1nfbp1hb7pil83k` (`codigo_transaccion`),
  KEY `idx_pagos_orden` (`orden_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
INSERT INTO `pagos` VALUES (1,'e2eaa63d-62be-44eb-ae9a-b164971745e6','APROBADO','2026-11-19 00:31:16.709846','TARJETA_CREDITO',26991,NULL,20261118213116,'4444'),(2,'b094a4ae-6ab9-4f8a-aa31-1ed828aee365','APROBADO','2026-11-19 02:09:45.144045','TARJETA_CREDITO',26991,NULL,20261118230945,'4444'),(3,'80df4c8c-22b5-4269-bd30-e4330e82086b','APROBADO','2026-11-19 02:13:34.420964','TARJETA_CREDITO',53982,NULL,20261118231333,'4444'),(4,'cecf32ac-7057-4f4e-9ac7-534ddd96d0f2','APROBADO','2026-11-19 02:13:43.582689','TARJETA_CREDITO',26991,NULL,20261118231343,'4444');
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'db_pagos'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-19  2:14:04
