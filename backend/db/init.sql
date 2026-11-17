-- ============================================================
-- Level-Up Gamer - Inicializacion de bases de datos
-- Se ejecuta solo la primera vez que se crea el volumen MySQL.
-- ============================================================

CREATE DATABASE IF NOT EXISTS db_login
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS db_productos
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS db_pagos
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS levelup_reportes
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usuario de aplicacion compartido por los cuatro microservicios.
CREATE USER IF NOT EXISTS 'levelup'@'%' IDENTIFIED BY 'levelup';

GRANT ALL PRIVILEGES ON db_login.*        TO 'levelup'@'%';
GRANT ALL PRIVILEGES ON db_productos.*    TO 'levelup'@'%';
GRANT ALL PRIVILEGES ON db_pagos.*       TO 'levelup'@'%';
GRANT ALL PRIVILEGES ON levelup_reportes.* TO 'levelup'@'%';

FLUSH PRIVILEGES;
