-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`Clientes_Usuario`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Clientes_Usuario` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Clientes_Usuario` (
  `Id_Cliente` INT NOT NULL AUTO_INCREMENT,
  `DNI` INT NOT NULL,
  `Nombre` VARCHAR(45) NOT NULL,
  `Telefono` VARCHAR(20) NOT NULL,
  `Email` VARCHAR(45) NOT NULL,
  `Password` VARCHAR(255) NOT NULL,
  `Foto` VARCHAR(45) NULL,
  PRIMARY KEY (`Id_Cliente`),
  UNIQUE INDEX `Id_clientes_UNIQUE` (`Id_Cliente` ASC) VISIBLE,
  UNIQUE INDEX `DNI_UNIQUE` (`DNI` ASC) VISIBLE,
  UNIQUE INDEX `Telefono_UNIQUE` (`Telefono` ASC) VISIBLE,
  UNIQUE INDEX `Email_UNIQUE` (`Email` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Vendedor`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Vendedor` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Vendedor` (
  `Id_Vendedor` INT NOT NULL AUTO_INCREMENT,
  `Foto` VARCHAR(45) NULL,
  `Email` VARCHAR(45) NOT NULL,
  UNIQUE INDEX `Id_Vendedor_UNIQUE` (`Id_Vendedor` ASC) VISIBLE,
  PRIMARY KEY (`Id_Vendedor`),
  UNIQUE INDEX `Email_UNIQUE` (`Email` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Productos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Productos` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Productos` (
  `Id_Productos` INT NOT NULL AUTO_INCREMENT,
  `Stock` INT NOT NULL,
  `Descripcion` VARCHAR(160) NOT NULL,
  `Categoria` VARCHAR(45) NOT NULL,
  `Variacion` VARCHAR(45) NOT NULL,
  `Precio` DECIMAL(10) NOT NULL,
  `Nombre` VARCHAR(45) NOT NULL,
  `Imagen` VARCHAR(255) NULL,
  `Destacado` TINYINT(1) NOT NULL DEFAULT 0,
  `Vendedor_Id_Vendedor` INT NULL,
  PRIMARY KEY (`Id_Productos`),
  UNIQUE INDEX `Id_Productos_UNIQUE` (`Id_Productos` ASC) VISIBLE,
  INDEX `fk_Productos_Vendedor1_idx` (`Vendedor_Id_Vendedor` ASC) VISIBLE,
  CONSTRAINT `fk_Productos_Vendedor1`
    FOREIGN KEY (`Vendedor_Id_Vendedor`)
    REFERENCES `mydb`.`Vendedor` (`Id_Vendedor`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Compra`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Compra` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Compra` (
  `Id_Compra` INT NOT NULL AUTO_INCREMENT,
  `Fecha` DATETIME NOT NULL,
  `Estado` VARCHAR(45) NOT NULL,
  `Direccion` VARCHAR(45) NOT NULL,
  `Metodo_Pago` VARCHAR(45) NOT NULL,
  `Clientes_Usuario_Id_Cliente` INT NOT NULL,
  PRIMARY KEY (`Id_Compra`),
  UNIQUE INDEX `Id_Compra_UNIQUE` (`Id_Compra` ASC) VISIBLE,
  INDEX `fk_Compra_Clientes_Usuario1_idx` (`Clientes_Usuario_Id_Cliente` ASC) VISIBLE,
  CONSTRAINT `fk_Compra_Clientes_Usuario1`
    FOREIGN KEY (`Clientes_Usuario_Id_Cliente`)
    REFERENCES `mydb`.`Clientes_Usuario` (`Id_Cliente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Comentarios`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Comentarios` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Comentarios` (
  `Id_Comentarios` INT NOT NULL,
  `Puntaje` INT NOT NULL,
  `Fecha` DATETIME NOT NULL,
  `Respuesta` VARCHAR(45) NULL,
  `Clientes_Usuario_Id_Cliente` INT NOT NULL,
  PRIMARY KEY (`Id_Comentarios`),
  UNIQUE INDEX `Id_Comentarios_UNIQUE` (`Id_Comentarios` ASC) VISIBLE,
  INDEX `fk_Comentarios_Clientes_Usuario1_idx` (`Clientes_Usuario_Id_Cliente` ASC) VISIBLE,
  CONSTRAINT `fk_Comentarios_Clientes_Usuario1`
    FOREIGN KEY (`Clientes_Usuario_Id_Cliente`)
    REFERENCES `mydb`.`Clientes_Usuario` (`Id_Cliente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Tarjetas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Tarjetas` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Tarjetas` (
  `Id_Tarjetas` INT NOT NULL,
  `Codigo_seguridad` INT NOT NULL,
  `Propietario` VARCHAR(45) NOT NULL,
  `Tipo` VARCHAR(45) NOT NULL,
  `Clientes_Usuario_Id_Cliente` INT NOT NULL,
  PRIMARY KEY (`Id_Tarjetas`),
  UNIQUE INDEX `Id_Tarjetas_UNIQUE` (`Id_Tarjetas` ASC) VISIBLE,
  INDEX `fk_Tarjetas_Clientes_Usuario1_idx` (`Clientes_Usuario_Id_Cliente` ASC) VISIBLE,
  CONSTRAINT `fk_Tarjetas_Clientes_Usuario1`
    FOREIGN KEY (`Clientes_Usuario_Id_Cliente`)
    REFERENCES `mydb`.`Clientes_Usuario` (`Id_Cliente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Direcciones`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Direcciones` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Direcciones` (
  `Id_Direcciones` INT NOT NULL,
  `Descripcion` VARCHAR(45) NOT NULL,
  `Calle` VARCHAR(45) NOT NULL,
  `Codigo_Postal` VARCHAR(45) NOT NULL,
  `Clientes_Usuario_Id_Cliente` INT NOT NULL,
  PRIMARY KEY (`Id_Direcciones`),
  INDEX `fk_Direcciones_Clientes_Usuario1_idx` (`Clientes_Usuario_Id_Cliente` ASC) VISIBLE,
  CONSTRAINT `fk_Direcciones_Clientes_Usuario1`
    FOREIGN KEY (`Clientes_Usuario_Id_Cliente`)
    REFERENCES `mydb`.`Clientes_Usuario` (`Id_Cliente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Respuestas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Respuestas` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Respuestas` (
  `Id_Respuestas` INT NOT NULL,
  `Propietario` VARCHAR(45) NOT NULL,
  `Fecha` DATETIME NOT NULL,
  `Respuesta` VARCHAR(45) NOT NULL,
  `Vendedor_Id_Vendedor` INT NOT NULL,
  PRIMARY KEY (`Id_Respuestas`),
  INDEX `fk_Respuestas_Vendedor1_idx` (`Vendedor_Id_Vendedor` ASC) VISIBLE,
  CONSTRAINT `fk_Respuestas_Vendedor1`
    FOREIGN KEY (`Vendedor_Id_Vendedor`)
    REFERENCES `mydb`.`Vendedor` (`Id_Vendedor`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Compra_Productos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Compra_Productos` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Compra_Productos` (
  `Compra_Id_Compra` INT NOT NULL,
  `Productos_Id_Productos` INT NOT NULL,
  PRIMARY KEY (`Compra_Id_Compra`, `Productos_Id_Productos`),
  INDEX `fk_Compra_has_Productos_Productos1_idx` (`Productos_Id_Productos` ASC) VISIBLE,
  INDEX `fk_Compra_has_Productos_Compra1_idx` (`Compra_Id_Compra` ASC) VISIBLE,
  CONSTRAINT `fk_Compra_has_Productos_Compra1`
    FOREIGN KEY (`Compra_Id_Compra`)
    REFERENCES `mydb`.`Compra` (`Id_Compra`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Compra_has_Productos_Productos1`
    FOREIGN KEY (`Productos_Id_Productos`)
    REFERENCES `mydb`.`Productos` (`Id_Productos`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Datos iniciales: productos del catálogo
-- -----------------------------------------------------
INSERT INTO `mydb`.`Productos` (`Nombre`, `Categoria`, `Descripcion`, `Precio`, `Stock`, `Variacion`, `Imagen`, `Destacado`) VALUES
('RTX 5090', 'gpu', 'Potencia extrema para gaming y trabajo profesional.', 2999999, 10, 'Única', 'IMG/productos/geforce-rtx-5090.jpg', 1),
('AMD Ryzen 9 9950X', 'procesador', 'Procesador de alto rendimiento para tareas exigentes.', 799999, 10, 'Única', 'IMG/productos/Ryzen-9-9950x.jpg', 1),
('DDR5 32GB', 'ram', 'Memoria rápida para gaming y productividad.', 179999, 10, 'Única', 'IMG/productos/kingston.jpg', 1),
('SSD NVMe 2TB', 'almacenamiento', 'Velocidad extrema para carga y almacenamiento.', 249999, 10, 'Única', 'IMG/productos/ssd2tb.webp', 0),
('Monitor 4K', 'monitor', 'Imagen ultra nítida para trabajo y entretenimiento.', 549999, 10, 'Única', 'IMG/productos/Odyssey-G7.jpg', 1),
('Logitech G Pro X', 'periferico', 'Precisión y rendimiento para esports.', 129999, 10, 'Única', 'IMG/productos/LogitechGproX.jpg', 0);


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
