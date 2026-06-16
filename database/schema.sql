-- Ecomma database schema for XAMPP MySQL / MariaDB
-- Run in phpMyAdmin or: mysql -u root < database/schema.sql

CREATE DATABASE IF NOT EXISTS ecomma
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecomma;

CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(50)  NOT NULL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('user', 'seller', 'admin') NOT NULL DEFAULT 'user',
  name          VARCHAR(255) NOT NULL,
  shop_name     VARCHAR(255) DEFAULT NULL,
  created_at    BIGINT       NOT NULL,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id            INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  category      VARCHAR(50)  NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  icon          VARCHAR(10)  NOT NULL DEFAULT '📦',
  image         TEXT         NOT NULL,
  price         INT          NOT NULL,
  rating        DECIMAL(2,1) NOT NULL DEFAULT 4.0,
  reviews       INT          NOT NULL DEFAULT 0,
  seller        VARCHAR(255) NOT NULL,
  seller_id     VARCHAR(50)  DEFAULT NULL,
  added_by      VARCHAR(20)  NOT NULL DEFAULT 'seed',
  is_deleted    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at    BIGINT       NOT NULL,
  INDEX idx_products_category (category),
  INDEX idx_products_seller (seller_id),
  INDEX idx_products_deleted (is_deleted),
  CONSTRAINT fk_products_seller
    FOREIGN KEY (seller_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;
