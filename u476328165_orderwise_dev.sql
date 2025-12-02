-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 26-11-2025 a las 21:15:39
-- Versión del servidor: 11.8.3-MariaDB-log
-- Versión de PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `u476328165_orderwise_dev`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `branch_offices`
--

CREATE TABLE `branch_offices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`address`)),
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `branch_office_category`
--

CREATE TABLE `branch_office_category` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `branch_office_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `branch_office_stock_products`
--

CREATE TABLE `branch_office_stock_products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `stock_quantity` double(8,2) NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `branch_office_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `branch_office_user`
--

CREATE TABLE `branch_office_user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `branch_office_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bussine_types`
--

CREATE TABLE `bussine_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bussine_type_module`
--

CREATE TABLE `bussine_type_module` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `bussine_type_id` bigint(20) UNSIGNED NOT NULL,
  `module_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cashboxes`
--

CREATE TABLE `cashboxes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` enum('active','inactive','maintenance') NOT NULL,
  `branch_office_id` bigint(20) UNSIGNED NOT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cashbox_user`
--

CREATE TABLE `cashbox_user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `cashbox_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `init_balance` decimal(10,2) DEFAULT NULL,
  `init_date` date NOT NULL,
  `user_close_id` bigint(20) UNSIGNED DEFAULT NULL,
  `end_balance` decimal(10,2) DEFAULT NULL,
  `close_date` date DEFAULT NULL,
  `status` enum('open','closed') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cashflows`
--

CREATE TABLE `cashflows` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL,
  `actual_amount` decimal(30,2) DEFAULT NULL,
  `company_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type_cashflow` enum('credit','debit','withdrawal','init_cashbox','close_cashbox') NOT NULL DEFAULT 'credit',
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `branch_office_id` bigint(20) UNSIGNED NOT NULL,
  `cashbox_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `payment_method_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `printer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `aliquot_type` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`aliquot_type`)),
  `show_catalog` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `company_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `coins`
--

CREATE TABLE `coins` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `symbol` varchar(255) NOT NULL,
  `company_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `companies`
--

CREATE TABLE `companies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `document_number` varchar(255) NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `billing` tinyint(1) DEFAULT 0,
  `photo_url` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `business_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `country_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_test` tinyint(1) NOT NULL DEFAULT 0,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `company_configs`
--

CREATE TABLE `company_configs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) UNSIGNED DEFAULT NULL,
  `point_of_sale` int(11) DEFAULT 1,
  `coin_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type_of_service_id` bigint(20) UNSIGNED DEFAULT NULL,
  `invoice_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `printer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `payment_method_id` bigint(20) UNSIGNED DEFAULT NULL,
  `other` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`other`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_table` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `company_role_user`
--

CREATE TABLE `company_role_user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `countries`
--

CREATE TABLE `countries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(5) NOT NULL,
  `coin_id` bigint(20) UNSIGNED NOT NULL,
  `phone_code` varchar(10) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `counts`
--

CREATE TABLE `counts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `branch_office_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('active','closed') NOT NULL DEFAULT 'active',
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `courier_locations`
--

CREATE TABLE `courier_locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `delivery_run_id` bigint(20) UNSIGNED NOT NULL,
  `courier_id` bigint(20) UNSIGNED NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `accuracy` decimal(8,2) DEFAULT NULL COMMENT 'Accuracy in meters',
  `altitude` decimal(8,2) DEFAULT NULL COMMENT 'Altitude in meters',
  `heading` decimal(5,2) DEFAULT NULL COMMENT 'Degrees from north (0-360)',
  `speed` decimal(8,2) DEFAULT NULL COMMENT 'Speed in m/s',
  `device_type` varchar(20) DEFAULT NULL COMMENT 'web, ios, android',
  `is_mock` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Detect fake GPS',
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `delivery_runs`
--

CREATE TABLE `delivery_runs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `run_number` varchar(255) NOT NULL,
  `status` enum('draft','en_route','completed','cancelled') NOT NULL DEFAULT 'draft',
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `courier_id` bigint(20) UNSIGNED NOT NULL,
  `origin_branch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `route_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Google Directions API response' CHECK (json_valid(`route_data`)),
  `total_distance_km` decimal(10,2) DEFAULT NULL,
  `estimated_duration_minutes` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `delivery_run_events`
--

CREATE TABLE `delivery_run_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `delivery_run_id` bigint(20) UNSIGNED NOT NULL,
  `actor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `event_type` varchar(255) NOT NULL COMMENT 'run_created, run_started, transfer_delivered, etc.',
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Event-specific data' CHECK (json_valid(`payload`)),
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `delivery_run_transfers`
--

CREATE TABLE `delivery_run_transfers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `delivery_run_id` bigint(20) UNSIGNED NOT NULL,
  `transfer_stock_id` bigint(20) UNSIGNED NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT 'Optimized delivery sequence',
  `delivery_status` enum('pending','in_transit','delivered','failed') NOT NULL DEFAULT 'pending',
  `delivered_at` timestamp NULL DEFAULT NULL,
  `delivered_by` bigint(20) UNSIGNED DEFAULT NULL,
  `delivery_latitude` decimal(10,7) DEFAULT NULL,
  `delivery_longitude` decimal(10,7) DEFAULT NULL,
  `delivery_notes` text DEFAULT NULL,
  `delivery_photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of photo URLs' CHECK (json_valid(`delivery_photos`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `electronic_invoices`
--

CREATE TABLE `electronic_invoices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_id` bigint(20) UNSIGNED NOT NULL,
  `fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`fields`)),
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `partial_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`partial_fields`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `exchange_rates`
--

CREATE TABLE `exchange_rates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `coin_id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `files`
--

CREATE TABLE `files` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `fileable_type` varchar(255) NOT NULL,
  `fileable_id` bigint(20) UNSIGNED NOT NULL,
  `path` text NOT NULL,
  `type` varchar(255) DEFAULT NULL COMMENT 'image, video, document, etc',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoices`
--

CREATE TABLE `invoices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `exchange_rate` double(8,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) DEFAULT 'pending',
  `invoice_type_id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type_of_service_id` bigint(20) UNSIGNED NOT NULL,
  `description` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `coin_id` bigint(20) UNSIGNED DEFAULT NULL,
  `billing` tinyint(1) DEFAULT 0,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `delivery_person_id` bigint(20) UNSIGNED DEFAULT NULL,
  `seller_id` bigint(20) UNSIGNED DEFAULT NULL,
  `cashbox_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `branch_office_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoice_delivery_locations`
--

CREATE TABLE `invoice_delivery_locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_delivery_run_id` bigint(20) UNSIGNED NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `accuracy` decimal(10,2) DEFAULT NULL COMMENT 'Accuracy in meters',
  `altitude` decimal(10,2) DEFAULT NULL COMMENT 'Altitude in meters',
  `heading` decimal(5,2) DEFAULT NULL COMMENT 'Direction in degrees',
  `speed` decimal(10,2) DEFAULT NULL COMMENT 'Speed in m/s',
  `device_type` varchar(20) DEFAULT NULL COMMENT 'mobile or web',
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoice_delivery_runs`
--

CREATE TABLE `invoice_delivery_runs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `delivery_person_id` bigint(20) UNSIGNED NOT NULL,
  `branch_office_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('draft','en_route','completed','cancelled') NOT NULL DEFAULT 'draft',
  `total_distance_km` decimal(10,2) DEFAULT NULL COMMENT 'Total distance in km',
  `estimated_duration_minutes` int(11) DEFAULT NULL COMMENT 'Estimated duration in minutes',
  `optimized_route_data` text DEFAULT NULL COMMENT 'JSON data from route optimization',
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoice_delivery_run_events`
--

CREATE TABLE `invoice_delivery_run_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_delivery_run_id` bigint(20) UNSIGNED NOT NULL,
  `actor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `event_type` varchar(50) NOT NULL COMMENT 'Type of event: started, completed, invoice_delivered, etc.',
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Additional event data' CHECK (json_valid(`payload`)),
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoice_delivery_run_items`
--

CREATE TABLE `invoice_delivery_run_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_delivery_run_id` bigint(20) UNSIGNED NOT NULL,
  `invoice_id` bigint(20) UNSIGNED NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT 'Order in the route',
  `delivery_status` enum('pending','arrived','delivered','failed') NOT NULL DEFAULT 'pending',
  `arrived_at` timestamp NULL DEFAULT NULL COMMENT 'When courier arrived at location',
  `delivered_at` timestamp NULL DEFAULT NULL COMMENT 'When delivery was completed',
  `delivered_by` bigint(20) UNSIGNED DEFAULT NULL,
  `delivery_latitude` decimal(10,7) DEFAULT NULL,
  `delivery_longitude` decimal(10,7) DEFAULT NULL,
  `delivery_notes` text DEFAULT NULL,
  `delivery_photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of photo URLs' CHECK (json_valid(`delivery_photos`)),
  `signature_data` text DEFAULT NULL COMMENT 'Base64 signature image',
  `recipient_name` varchar(255) DEFAULT NULL,
  `recipient_document` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoice_discounts`
--

CREATE TABLE `invoice_discounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_id` bigint(20) UNSIGNED NOT NULL,
  `discountable_type` varchar(255) NOT NULL,
  `discountable_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoice_payments`
--

CREATE TABLE `invoice_payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payment_method_id` bigint(20) UNSIGNED NOT NULL,
  `coin_id` bigint(20) UNSIGNED NOT NULL,
  `invoice_id` bigint(20) UNSIGNED NOT NULL,
  `exchange` double(8,2) NOT NULL DEFAULT 0.00,
  `amount` double(20,2) NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT 0.00,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `checked` tinyint(1) DEFAULT 0,
  `date_billing` timestamp NULL DEFAULT NULL,
  `reference` varchar(8) DEFAULT NULL,
  `payment_type` enum('cash','credit') NOT NULL DEFAULT 'cash',
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoice_product`
--

CREATE TABLE `invoice_product` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `promotion_id` bigint(20) UNSIGNED DEFAULT NULL,
  `promotion_detail_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_promotion_detail_id` bigint(20) UNSIGNED DEFAULT NULL,
  `amount` decimal(65,8) NOT NULL,
  `cost` float(30,8) DEFAULT NULL,
  `price` double(20,2) NOT NULL,
  `discount` double(8,2) DEFAULT 0.00,
  `taxe` double(8,2) DEFAULT 0.00,
  `observation` varchar(255) DEFAULT NULL,
  `printed_amount` decimal(10,2) DEFAULT 0.00,
  `is_ready` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoice_promotion`
--

CREATE TABLE `invoice_promotion` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_id` bigint(20) UNSIGNED NOT NULL,
  `promotion_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(30,8) NOT NULL,
  `price` decimal(30,8) NOT NULL,
  `cost` decimal(30,2) NOT NULL,
  `discount` decimal(8,2) DEFAULT 0.00,
  `taxe` decimal(8,2) DEFAULT 0.00,
  `observation` text DEFAULT NULL,
  `promotion_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`promotion_details`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoice_status_history`
--

CREATE TABLE `invoice_status_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoice_table`
--

CREATE TABLE `invoice_table` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_id` bigint(20) UNSIGNED NOT NULL,
  `table_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('busy','unoccupied') NOT NULL DEFAULT 'busy',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoice_taxe`
--

CREATE TABLE `invoice_taxe` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `taxe_id` bigint(20) UNSIGNED NOT NULL,
  `invoice_id` bigint(20) UNSIGNED NOT NULL,
  `amount` double(8,2) NOT NULL,
  `type_taxe` enum('percentage','fixed_quantity') NOT NULL DEFAULT 'percentage',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoice_types`
--

CREATE TABLE `invoice_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `acronym_serie` varchar(255) NOT NULL,
  `bill` tinyint(1) DEFAULT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoice_type_taxe`
--

CREATE TABLE `invoice_type_taxe` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `taxe_id` bigint(20) UNSIGNED NOT NULL,
  `invoice_type_id` bigint(20) UNSIGNED NOT NULL,
  `amount` double(8,2) NOT NULL,
  `type_taxe` enum('percentage','fixed_quantity') NOT NULL DEFAULT 'percentage',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `living_rooms`
--

CREATE TABLE `living_rooms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `width` double(8,2) DEFAULT NULL,
  `height` double(8,2) DEFAULT NULL,
  `company_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modules`
--

CREATE TABLE `modules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `link` varchar(255) NOT NULL,
  `section_id` bigint(20) UNSIGNED NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `position` int(11) NOT NULL DEFAULT 1,
  `visible` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Visibility in menu',
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `module_role`
--

CREATE TABLE `module_role` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `module_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oauth_access_tokens`
--

CREATE TABLE `oauth_access_tokens` (
  `id` varchar(100) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `scopes` text DEFAULT NULL,
  `revoked` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oauth_auth_codes`
--

CREATE TABLE `oauth_auth_codes` (
  `id` varchar(100) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `scopes` text DEFAULT NULL,
  `revoked` tinyint(1) NOT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oauth_clients`
--

CREATE TABLE `oauth_clients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `secret` varchar(100) DEFAULT NULL,
  `provider` varchar(255) DEFAULT NULL,
  `redirect` text NOT NULL,
  `personal_access_client` tinyint(1) NOT NULL,
  `password_client` tinyint(1) NOT NULL,
  `revoked` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oauth_personal_access_clients`
--

CREATE TABLE `oauth_personal_access_clients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oauth_refresh_tokens`
--

CREATE TABLE `oauth_refresh_tokens` (
  `id` varchar(100) NOT NULL,
  `access_token_id` varchar(100) NOT NULL,
  `revoked` tinyint(1) NOT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_number` int(11) NOT NULL,
  `address` text DEFAULT NULL,
  `delivery_date` date DEFAULT NULL,
  `branch_office_id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `delivery_person_id` bigint(20) UNSIGNED DEFAULT NULL,
  `client_id` bigint(20) UNSIGNED DEFAULT NULL,
  `seller_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('pending','on_process','finished','delivered') NOT NULL,
  `user_created_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_product`
--

CREATE TABLE `order_product` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` double(8,2) NOT NULL,
  `cost` double(8,2) NOT NULL,
  `price` double(8,2) NOT NULL,
  `observation` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `checked` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_table`
--

CREATE TABLE `order_table` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `table_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('busy','unoccupied') NOT NULL DEFAULT 'busy',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `attributes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attributes`)),
  `acronym` varchar(255) DEFAULT NULL,
  `company_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `printers`
--

CREATE TABLE `printers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `ip` varchar(255) DEFAULT NULL,
  `device` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `os` enum('windows','android') NOT NULL DEFAULT 'windows',
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `size` double(8,2) DEFAULT 57.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `company_id` bigint(20) UNSIGNED DEFAULT NULL,
  `cost` double(15,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_bundle` tinyint(1) NOT NULL DEFAULT 0,
  `is_addons` tinyint(1) NOT NULL DEFAULT 0,
  `is_default` tinyint(1) DEFAULT 0,
  `barcode` varchar(255) DEFAULT NULL,
  `price` double(15,2) NOT NULL,
  `skip_stock` tinyint(1) DEFAULT 1,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `aliquot_type` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`aliquot_type`)),
  `unit_of_measure_id` bigint(20) UNSIGNED DEFAULT NULL,
  `show_catalog` tinyint(1) NOT NULL DEFAULT 1,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `minimum_stock` decimal(8,2) DEFAULT 0.00,
  `sold` bigint(20) DEFAULT 1,
  `average_rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `ratings_count` int(11) NOT NULL DEFAULT 0,
  `favorites_count` int(11) NOT NULL DEFAULT 0,
  `profit_percentage` double(8,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_addon`
--

CREATE TABLE `product_addon` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `addon_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_bundles`
--

CREATE TABLE `product_bundles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `bundle_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` double(8,2) NOT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_counts`
--

CREATE TABLE `product_counts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `count_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `current_stock` double(8,2) NOT NULL DEFAULT 0.00,
  `quantity` double(8,2) NOT NULL DEFAULT 0.00,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `sales_during_count` double(8,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_favorites`
--

CREATE TABLE `product_favorites` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_images`
--

CREATE TABLE `product_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `url` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_price_lists`
--

CREATE TABLE `product_price_lists` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `branch_office_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `index` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(20,2) NOT NULL,
  `profit_percentage` decimal(10,2) DEFAULT 0.00,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_promotion_detail`
--

CREATE TABLE `product_promotion_detail` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `promotion_detail_id` bigint(20) UNSIGNED NOT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_purchase`
--

CREATE TABLE `product_purchase` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `cost` decimal(30,2) NOT NULL,
  `quantity` decimal(30,8) NOT NULL,
  `discount` decimal(8,2) DEFAULT 0.00,
  `taxe` decimal(8,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_ratings`
--

CREATE TABLE `product_ratings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL COMMENT 'Rating de 1 a 5',
  `comment` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_transfer_stock`
--

CREATE TABLE `product_transfer_stock` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `transfer_stock_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(8,3) NOT NULL,
  `received_quantity` decimal(8,3) DEFAULT NULL,
  `verification_status` varchar(255) NOT NULL DEFAULT 'pending',
  `cost` decimal(20,3) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `promotions`
--

CREATE TABLE `promotions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `company_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `channels` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`channels`)),
  `show_in_catalog` tinyint(1) NOT NULL DEFAULT 1,
  `requires_stock` tinyint(1) NOT NULL DEFAULT 0,
  `final_price` decimal(12,2) DEFAULT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `promotion_details`
--

CREATE TABLE `promotion_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `promotion_id` bigint(20) UNSIGNED NOT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `purchases`
--

CREATE TABLE `purchases` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `exchange_rate` double(8,2) NOT NULL DEFAULT 0.00,
  `purchase_code` varchar(255) DEFAULT NULL,
  `purchase_number` bigint(20) NOT NULL,
  `delivery_date` date DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `invoice_type_id` bigint(20) UNSIGNED NOT NULL,
  `type_of_service_id` bigint(20) UNSIGNED NOT NULL,
  `coin_id` bigint(20) UNSIGNED NOT NULL,
  `provider_id` bigint(20) UNSIGNED NOT NULL,
  `branch_office_id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `purchase_payments`
--

CREATE TABLE `purchase_payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payment_method_id` bigint(20) UNSIGNED NOT NULL,
  `coin_id` bigint(20) UNSIGNED NOT NULL,
  `purchase_id` bigint(20) UNSIGNED NOT NULL,
  `exchange` double(30,8) DEFAULT 0.00000000,
  `amount` double(30,8) NOT NULL,
  `reference` double(8,2) DEFAULT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `acronym` varchar(255) NOT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sections`
--

CREATE TABLE `sections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `index` int(11) NOT NULL,
  `icon` varchar(255) NOT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `status_histories`
--

CREATE TABLE `status_histories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `statusable_type` varchar(255) NOT NULL,
  `statusable_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(255) NOT NULL,
  `previous_status` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `user_created_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `changed_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `stock_products`
--

CREATE TABLE `stock_products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quantity` double(8,2) NOT NULL,
  `price` double(8,2) DEFAULT 0.00,
  `cost` double(8,2) DEFAULT 0.00,
  `description` varchar(255) DEFAULT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `branch_office_id` bigint(20) UNSIGNED NOT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `subscription_plan_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('active','expired','cancelled','trial') NOT NULL DEFAULT 'trial',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `trial_end_date` date DEFAULT NULL,
  `branch_offices_count` int(11) NOT NULL DEFAULT 1,
  `total_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `auto_renew` tinyint(1) NOT NULL DEFAULT 1,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `notified_at` timestamp NULL DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `payment_id` varchar(255) DEFAULT NULL,
  `amount_paid` decimal(10,2) DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `subscription_history`
--

CREATE TABLE `subscription_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `subscription_id` bigint(20) UNSIGNED NOT NULL,
  `subscription_plan_id` bigint(20) UNSIGNED NOT NULL,
  `action` enum('created','renewed','upgraded','downgraded','cancelled','expired') NOT NULL,
  `previous_status` varchar(255) DEFAULT NULL,
  `new_status` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `price_per_branch` decimal(10,2) NOT NULL DEFAULT 0.00,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `has_api_access` tinyint(1) NOT NULL DEFAULT 0,
  `has_multiple_branches` tinyint(1) NOT NULL DEFAULT 0,
  `max_branches` int(11) DEFAULT NULL,
  `max_users` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `trial_days` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tables`
--

CREATE TABLE `tables` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `shape` varchar(255) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `index` int(11) DEFAULT NULL,
  `company_id` bigint(20) UNSIGNED DEFAULT NULL,
  `y` int(11) DEFAULT NULL,
  `x` int(11) DEFAULT NULL,
  `width` int(11) DEFAULT 50,
  `height` int(11) DEFAULT 50,
  `living_room_id` bigint(20) UNSIGNED NOT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `taxes`
--

CREATE TABLE `taxes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `company_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transfer_stocks`
--

CREATE TABLE `transfer_stocks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transfer_number` int(11) NOT NULL,
  `observations` varchar(255) DEFAULT NULL,
  `status` enum('pending','accepted','in_process','in_transit','verified','delivered','reconciled','on_process') DEFAULT 'pending',
  `verified_at` timestamp NULL DEFAULT NULL,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `origin_branch_office_id` bigint(20) UNSIGNED NOT NULL,
  `destination_branch_office_id` bigint(20) UNSIGNED NOT NULL,
  `return_transfer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `verified_by` bigint(20) UNSIGNED DEFAULT NULL,
  `accepted_by` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tutorials`
--

CREATE TABLE `tutorials` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `miniature_path` varchar(255) DEFAULT NULL,
  `video_path` varchar(255) NOT NULL,
  `status` enum('published','draft','hidden') NOT NULL DEFAULT 'draft',
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `type_of_services`
--

CREATE TABLE `type_of_services` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unit_of_measures`
--

CREATE TABLE `unit_of_measures` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `acronym` varchar(255) NOT NULL,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `url_image` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `google_email` varchar(255) DEFAULT NULL,
  `facebook_id` varchar(255) DEFAULT NULL,
  `facebook_email` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `document_number` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `timezone` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `vehicle_plate` varchar(20) DEFAULT NULL,
  `vehicle_type` enum('motorcycle','car','van','truck') DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_courier` tinyint(1) NOT NULL DEFAULT 0,
  `company_session_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_root` tinyint(1) DEFAULT 0,
  `is_credit` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 0,
  `document_type` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`document_type`)),
  `condition_iva_receptor` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`condition_iva_receptor`)),
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_activity_logs`
--

CREATE TABLE `user_activity_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `origin` text DEFAULT NULL,
  `method` varchar(10) NOT NULL,
  `endpoint` varchar(500) NOT NULL,
  `full_url` text NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `status_code` int(11) NOT NULL,
  `response_body` text DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `response_time` double(8,2) NOT NULL,
  `headers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`headers`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `versions`
--

CREATE TABLE `versions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `version` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `user_created_id` bigint(20) UNSIGNED NOT NULL,
  `user_updated_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `branch_offices`
--
ALTER TABLE `branch_offices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_offices_company_id_foreign` (`company_id`),
  ADD KEY `branch_offices_user_created_id_foreign` (`user_created_id`),
  ADD KEY `branch_offices_user_updated_id_foreign` (`user_updated_id`);

--
-- Indices de la tabla `branch_office_category`
--
ALTER TABLE `branch_office_category`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `branch_office_category_category_id_branch_office_id_unique` (`category_id`,`branch_office_id`),
  ADD KEY `branch_office_category_branch_office_id_foreign` (`branch_office_id`);

--
-- Indices de la tabla `branch_office_stock_products`
--
ALTER TABLE `branch_office_stock_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_office_stock_products_product_id_foreign` (`product_id`),
  ADD KEY `branch_office_stock_products_branch_office_id_foreign` (`branch_office_id`);

--
-- Indices de la tabla `branch_office_user`
--
ALTER TABLE `branch_office_user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_office_user_branch_office_id_foreign` (`branch_office_id`),
  ADD KEY `branch_office_user_user_id_foreign` (`user_id`);

--
-- Indices de la tabla `bussine_types`
--
ALTER TABLE `bussine_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bussine_types_user_created_id_foreign` (`user_created_id`),
  ADD KEY `bussine_types_user_updated_id_foreign` (`user_updated_id`);

--
-- Indices de la tabla `bussine_type_module`
--
ALTER TABLE `bussine_type_module`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bussine_type_module_bussine_type_id_foreign` (`bussine_type_id`),
  ADD KEY `bussine_type_module_module_id_foreign` (`module_id`);

--
-- Indices de la tabla `cashboxes`
--
ALTER TABLE `cashboxes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cashboxes_branch_office_id_foreign` (`branch_office_id`),
  ADD KEY `cashboxes_user_created_id_foreign` (`user_created_id`),
  ADD KEY `cashboxes_user_updated_id_foreign` (`user_updated_id`);

--
-- Indices de la tabla `cashbox_user`
--
ALTER TABLE `cashbox_user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cashbox_user_cashbox_id_foreign` (`cashbox_id`),
  ADD KEY `cashbox_user_user_id_foreign` (`user_id`),
  ADD KEY `cashbox_user_user_close_id_foreign` (`user_close_id`);

--
-- Indices de la tabla `cashflows`
--
ALTER TABLE `cashflows`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cashflows_cashbox_user_id_foreign` (`cashbox_user_id`);

--
-- Indices de la tabla `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categories_printer_id_foreign` (`printer_id`);

--
-- Indices de la tabla `coins`
--
ALTER TABLE `coins`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `companies_user_created_id_foreign` (`user_created_id`),
  ADD KEY `companies_user_updated_id_foreign` (`user_updated_id`),
  ADD KEY `companies_business_type_id_foreign` (`business_type_id`),
  ADD KEY `companies_country_id_foreign` (`country_id`);

--
-- Indices de la tabla `company_configs`
--
ALTER TABLE `company_configs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_configs_company_id_foreign` (`company_id`),
  ADD KEY `company_configs_coin_id_foreign` (`coin_id`),
  ADD KEY `company_configs_type_of_service_id_foreign` (`type_of_service_id`),
  ADD KEY `company_configs_invoice_type_id_foreign` (`invoice_type_id`),
  ADD KEY `company_configs_payment_method_id_foreign` (`payment_method_id`),
  ADD KEY `company_configs_client_id_foreign` (`client_id`),
  ADD KEY `company_configs_printer_id_foreign` (`printer_id`);

--
-- Indices de la tabla `company_role_user`
--
ALTER TABLE `company_role_user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_role_user_company_id_foreign` (`company_id`),
  ADD KEY `company_role_user_user_id_foreign` (`user_id`),
  ADD KEY `company_role_user_role_id_foreign` (`role_id`);

--
-- Indices de la tabla `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `countries_code_unique` (`code`),
  ADD KEY `countries_coin_id_foreign` (`coin_id`),
  ADD KEY `countries_user_created_id_foreign` (`user_created_id`),
  ADD KEY `countries_user_updated_id_foreign` (`user_updated_id`);

--
-- Indices de la tabla `counts`
--
ALTER TABLE `counts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `counts_branch_office_id_foreign` (`branch_office_id`),
  ADD KEY `counts_user_id_foreign` (`user_id`);

--
-- Indices de la tabla `courier_locations`
--
ALTER TABLE `courier_locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `courier_locations_delivery_run_id_recorded_at_index` (`delivery_run_id`,`recorded_at`),
  ADD KEY `courier_locations_courier_id_recorded_at_index` (`courier_id`,`recorded_at`),
  ADD KEY `courier_locations_recorded_at_index` (`recorded_at`);

--
-- Indices de la tabla `delivery_runs`
--
ALTER TABLE `delivery_runs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `delivery_runs_run_number_unique` (`run_number`),
  ADD KEY `delivery_runs_origin_branch_id_foreign` (`origin_branch_id`),
  ADD KEY `delivery_runs_user_created_id_foreign` (`user_created_id`),
  ADD KEY `delivery_runs_user_updated_id_foreign` (`user_updated_id`),
  ADD KEY `delivery_runs_company_id_status_index` (`company_id`,`status`),
  ADD KEY `delivery_runs_courier_id_status_index` (`courier_id`,`status`),
  ADD KEY `delivery_runs_started_at_index` (`started_at`);

--
-- Indices de la tabla `delivery_run_events`
--
ALTER TABLE `delivery_run_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `delivery_run_events_delivery_run_id_created_at_index` (`delivery_run_id`,`created_at`),
  ADD KEY `delivery_run_events_event_type_index` (`event_type`),
  ADD KEY `delivery_run_events_actor_id_index` (`actor_id`);

--
-- Indices de la tabla `delivery_run_transfers`
--
ALTER TABLE `delivery_run_transfers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `delivery_run_transfers_delivery_run_id_transfer_stock_id_unique` (`delivery_run_id`,`transfer_stock_id`),
  ADD KEY `delivery_run_transfers_transfer_stock_id_foreign` (`transfer_stock_id`),
  ADD KEY `delivery_run_transfers_delivered_by_foreign` (`delivered_by`),
  ADD KEY `delivery_run_transfers_delivery_run_id_sort_order_index` (`delivery_run_id`,`sort_order`),
  ADD KEY `delivery_run_transfers_delivery_status_index` (`delivery_status`);

--
-- Indices de la tabla `electronic_invoices`
--
ALTER TABLE `electronic_invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `electronic_invoices_invoice_id_foreign` (`invoice_id`),
  ADD KEY `electronic_invoices_user_created_id_foreign` (`user_created_id`),
  ADD KEY `electronic_invoices_user_updated_id_foreign` (`user_updated_id`);

--
-- Indices de la tabla `exchange_rates`
--
ALTER TABLE `exchange_rates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exchange_rates_coin_id_foreign` (`coin_id`),
  ADD KEY `exchange_rates_company_id_foreign` (`company_id`);

--
-- Indices de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indices de la tabla `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `files_fileable_type_fileable_id_index` (`fileable_type`,`fileable_id`);

--
-- Indices de la tabla `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoices_delivery_person_id_foreign` (`delivery_person_id`),
  ADD KEY `invoices_cashbox_user_id_foreign` (`cashbox_user_id`);

--
-- Indices de la tabla `invoice_delivery_locations`
--
ALTER TABLE `invoice_delivery_locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_inv_del_locations_run_date` (`invoice_delivery_run_id`,`recorded_at`);

--
-- Indices de la tabla `invoice_delivery_runs`
--
ALTER TABLE `invoice_delivery_runs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_delivery_runs_branch_office_id_foreign` (`branch_office_id`),
  ADD KEY `invoice_delivery_runs_user_created_id_foreign` (`user_created_id`),
  ADD KEY `invoice_delivery_runs_user_updated_id_foreign` (`user_updated_id`),
  ADD KEY `invoice_delivery_runs_company_id_status_index` (`company_id`,`status`),
  ADD KEY `invoice_delivery_runs_delivery_person_id_status_index` (`delivery_person_id`,`status`),
  ADD KEY `invoice_delivery_runs_started_at_index` (`started_at`);

--
-- Indices de la tabla `invoice_delivery_run_events`
--
ALTER TABLE `invoice_delivery_run_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_delivery_run_events_actor_id_foreign` (`actor_id`),
  ADD KEY `idx_inv_del_run_events_run_date` (`invoice_delivery_run_id`,`created_at`),
  ADD KEY `idx_inv_del_run_events_type` (`event_type`);

--
-- Indices de la tabla `invoice_delivery_run_items`
--
ALTER TABLE `invoice_delivery_run_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_delivery_run_items_delivered_by_foreign` (`delivered_by`),
  ADD KEY `idx_inv_del_run_items_run_sort` (`invoice_delivery_run_id`,`sort_order`),
  ADD KEY `idx_inv_del_run_items_inv_status` (`invoice_id`,`delivery_status`);

--
-- Indices de la tabla `invoice_discounts`
--
ALTER TABLE `invoice_discounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_discounts_invoice_id_foreign` (`invoice_id`),
  ADD KEY `invoice_discounts_discountable_type_discountable_id_index` (`discountable_type`,`discountable_id`);

--
-- Indices de la tabla `invoice_payments`
--
ALTER TABLE `invoice_payments`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `invoice_product`
--
ALTER TABLE `invoice_product`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_product_promotion_id_foreign` (`promotion_id`),
  ADD KEY `invoice_product_promotion_detail_id_foreign` (`promotion_detail_id`),
  ADD KEY `invoice_product_product_promotion_detail_id_foreign` (`product_promotion_detail_id`);

--
-- Indices de la tabla `invoice_promotion`
--
ALTER TABLE `invoice_promotion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `invoice_status_history`
--
ALTER TABLE `invoice_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_status_history_user_id_foreign` (`user_id`),
  ADD KEY `invoice_status_history_invoice_id_created_at_index` (`invoice_id`,`created_at`);

--
-- Indices de la tabla `invoice_table`
--
ALTER TABLE `invoice_table`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `invoice_taxe`
--
ALTER TABLE `invoice_taxe`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `invoice_types`
--
ALTER TABLE `invoice_types`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `invoice_type_taxe`
--
ALTER TABLE `invoice_type_taxe`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indices de la tabla `living_rooms`
--
ALTER TABLE `living_rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `modules_section_id_foreign` (`section_id`);

--
-- Indices de la tabla `module_role`
--
ALTER TABLE `module_role`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indices de la tabla `oauth_access_tokens`
--
ALTER TABLE `oauth_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_access_tokens_user_id_index` (`user_id`);

--
-- Indices de la tabla `oauth_auth_codes`
--
ALTER TABLE `oauth_auth_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_auth_codes_user_id_index` (`user_id`);

--
-- Indices de la tabla `oauth_clients`
--
ALTER TABLE `oauth_clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_clients_user_id_index` (`user_id`);

--
-- Indices de la tabla `oauth_personal_access_clients`
--
ALTER TABLE `oauth_personal_access_clients`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `oauth_refresh_tokens`
--
ALTER TABLE `oauth_refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_refresh_tokens_access_token_id_index` (`access_token_id`);

--
-- Indices de la tabla `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_branch_office_id_foreign` (`branch_office_id`),
  ADD KEY `orders_company_id_foreign` (`company_id`),
  ADD KEY `orders_delivery_person_id_foreign` (`delivery_person_id`),
  ADD KEY `orders_client_id_foreign` (`client_id`),
  ADD KEY `orders_seller_id_foreign` (`seller_id`),
  ADD KEY `orders_user_created_id_foreign` (`user_created_id`),
  ADD KEY `orders_user_updated_id_foreign` (`user_updated_id`);

--
-- Indices de la tabla `order_product`
--
ALTER TABLE `order_product`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `order_table`
--
ALTER TABLE `order_table`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `password_resets_email_index` (`email`);

--
-- Indices de la tabla `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indices de la tabla `printers`
--
ALTER TABLE `printers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `printers_company_id_foreign` (`company_id`);

--
-- Indices de la tabla `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_unit_of_measure_id_foreign` (`unit_of_measure_id`);

--
-- Indices de la tabla `product_addon`
--
ALTER TABLE `product_addon`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_addon_product_id_foreign` (`product_id`),
  ADD KEY `product_addon_addon_id_foreign` (`addon_id`);

--
-- Indices de la tabla `product_bundles`
--
ALTER TABLE `product_bundles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_bundles_product_id_foreign` (`product_id`),
  ADD KEY `product_bundles_bundle_id_foreign` (`bundle_id`),
  ADD KEY `product_bundles_user_created_id_foreign` (`user_created_id`),
  ADD KEY `product_bundles_user_updated_id_foreign` (`user_updated_id`);

--
-- Indices de la tabla `product_counts`
--
ALTER TABLE `product_counts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_counts_count_id_foreign` (`count_id`),
  ADD KEY `product_counts_product_id_foreign` (`product_id`),
  ADD KEY `product_counts_user_created_id_foreign` (`user_created_id`);

--
-- Indices de la tabla `product_favorites`
--
ALTER TABLE `product_favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_favorites_user_id_product_id_unique` (`user_id`,`product_id`),
  ADD KEY `product_favorites_product_id_foreign` (`product_id`);

--
-- Indices de la tabla `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `product_price_lists`
--
ALTER TABLE `product_price_lists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_price_lists_branch_office_id_foreign` (`branch_office_id`),
  ADD KEY `product_price_lists_product_id_foreign` (`product_id`),
  ADD KEY `product_price_lists_user_created_id_foreign` (`user_created_id`),
  ADD KEY `product_price_lists_user_updated_id_foreign` (`user_updated_id`);

--
-- Indices de la tabla `product_promotion_detail`
--
ALTER TABLE `product_promotion_detail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_promotion_detail_product_id_foreign` (`product_id`),
  ADD KEY `product_promotion_detail_promotion_detail_id_foreign` (`promotion_detail_id`),
  ADD KEY `product_promotion_detail_user_created_id_foreign` (`user_created_id`),
  ADD KEY `product_promotion_detail_user_updated_id_foreign` (`user_updated_id`);

--
-- Indices de la tabla `product_purchase`
--
ALTER TABLE `product_purchase`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `product_ratings`
--
ALTER TABLE `product_ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_ratings_user_id_product_id_unique` (`user_id`,`product_id`),
  ADD KEY `product_ratings_product_id_index` (`product_id`);

--
-- Indices de la tabla `product_transfer_stock`
--
ALTER TABLE `product_transfer_stock`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_transfer_stock_product_id_foreign` (`product_id`),
  ADD KEY `product_transfer_stock_transfer_stock_id_foreign` (`transfer_stock_id`);

--
-- Indices de la tabla `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `promotions_user_created_id_foreign` (`user_created_id`),
  ADD KEY `promotions_user_updated_id_foreign` (`user_updated_id`);

--
-- Indices de la tabla `promotion_details`
--
ALTER TABLE `promotion_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `promotion_details_promotion_id_foreign` (`promotion_id`),
  ADD KEY `promotion_details_user_created_id_foreign` (`user_created_id`),
  ADD KEY `promotion_details_user_updated_id_foreign` (`user_updated_id`);

--
-- Indices de la tabla `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `purchase_payments`
--
ALTER TABLE `purchase_payments`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sections_user_created_id_foreign` (`user_created_id`),
  ADD KEY `sections_user_updated_id_foreign` (`user_updated_id`);

--
-- Indices de la tabla `status_histories`
--
ALTER TABLE `status_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `status_histories_statusable_type_statusable_id_index` (`statusable_type`,`statusable_id`),
  ADD KEY `status_histories_user_created_id_foreign` (`user_created_id`),
  ADD KEY `status_histories_user_updated_id_foreign` (`user_updated_id`);

--
-- Indices de la tabla `stock_products`
--
ALTER TABLE `stock_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stock_products_product_id_foreign` (`product_id`),
  ADD KEY `stock_products_branch_office_id_foreign` (`branch_office_id`),
  ADD KEY `stock_products_user_created_id_foreign` (`user_created_id`),
  ADD KEY `stock_products_user_updated_id_foreign` (`user_updated_id`);

--
-- Indices de la tabla `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscriptions_subscription_plan_id_foreign` (`subscription_plan_id`),
  ADD KEY `subscriptions_company_id_index` (`company_id`),
  ADD KEY `subscriptions_status_index` (`status`),
  ADD KEY `subscriptions_end_date_index` (`end_date`);

--
-- Indices de la tabla `subscription_history`
--
ALTER TABLE `subscription_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscription_history_subscription_id_foreign` (`subscription_id`),
  ADD KEY `subscription_history_subscription_plan_id_foreign` (`subscription_plan_id`),
  ADD KEY `subscription_history_user_id_foreign` (`user_id`);

--
-- Indices de la tabla `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subscription_plans_slug_unique` (`slug`);

--
-- Indices de la tabla `tables`
--
ALTER TABLE `tables`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `taxes`
--
ALTER TABLE `taxes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `transfer_stocks`
--
ALTER TABLE `transfer_stocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transfer_stocks_origin_branch_office_id_foreign` (`origin_branch_office_id`),
  ADD KEY `transfer_stocks_destination_branch_office_id_foreign` (`destination_branch_office_id`),
  ADD KEY `transfer_stocks_company_id_foreign` (`company_id`),
  ADD KEY `transfer_stocks_user_created_id_foreign` (`user_created_id`),
  ADD KEY `transfer_stocks_user_updated_id_foreign` (`user_updated_id`),
  ADD KEY `transfer_stocks_verified_by_foreign` (`verified_by`),
  ADD KEY `transfer_stocks_return_transfer_id_index` (`return_transfer_id`),
  ADD KEY `transfer_stocks_accepted_by_foreign` (`accepted_by`);

--
-- Indices de la tabla `tutorials`
--
ALTER TABLE `tutorials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tutorials_user_created_id_foreign` (`user_created_id`),
  ADD KEY `tutorials_user_updated_id_foreign` (`user_updated_id`);

--
-- Indices de la tabla `type_of_services`
--
ALTER TABLE `type_of_services`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `unit_of_measures`
--
ALTER TABLE `unit_of_measures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `unit_of_measures_user_created_id_foreign` (`user_created_id`),
  ADD KEY `unit_of_measures_user_updated_id_foreign` (`user_updated_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_company_session_id_foreign` (`company_session_id`);

--
-- Indices de la tabla `user_activity_logs`
--
ALTER TABLE `user_activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_activity_logs_user_id_foreign` (`user_id`);

--
-- Indices de la tabla `versions`
--
ALTER TABLE `versions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `versions_user_created_id_foreign` (`user_created_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `branch_offices`
--
ALTER TABLE `branch_offices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `branch_office_category`
--
ALTER TABLE `branch_office_category`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `branch_office_stock_products`
--
ALTER TABLE `branch_office_stock_products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `branch_office_user`
--
ALTER TABLE `branch_office_user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `bussine_types`
--
ALTER TABLE `bussine_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `bussine_type_module`
--
ALTER TABLE `bussine_type_module`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cashboxes`
--
ALTER TABLE `cashboxes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cashbox_user`
--
ALTER TABLE `cashbox_user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cashflows`
--
ALTER TABLE `cashflows`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `coins`
--
ALTER TABLE `coins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `company_configs`
--
ALTER TABLE `company_configs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `company_role_user`
--
ALTER TABLE `company_role_user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `countries`
--
ALTER TABLE `countries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `counts`
--
ALTER TABLE `counts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `courier_locations`
--
ALTER TABLE `courier_locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `delivery_runs`
--
ALTER TABLE `delivery_runs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `delivery_run_events`
--
ALTER TABLE `delivery_run_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `delivery_run_transfers`
--
ALTER TABLE `delivery_run_transfers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `electronic_invoices`
--
ALTER TABLE `electronic_invoices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `exchange_rates`
--
ALTER TABLE `exchange_rates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `files`
--
ALTER TABLE `files`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `invoice_delivery_locations`
--
ALTER TABLE `invoice_delivery_locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `invoice_delivery_runs`
--
ALTER TABLE `invoice_delivery_runs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `invoice_delivery_run_events`
--
ALTER TABLE `invoice_delivery_run_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `invoice_delivery_run_items`
--
ALTER TABLE `invoice_delivery_run_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `invoice_discounts`
--
ALTER TABLE `invoice_discounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `invoice_payments`
--
ALTER TABLE `invoice_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `invoice_product`
--
ALTER TABLE `invoice_product`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `invoice_promotion`
--
ALTER TABLE `invoice_promotion`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `invoice_status_history`
--
ALTER TABLE `invoice_status_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `invoice_table`
--
ALTER TABLE `invoice_table`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `invoice_taxe`
--
ALTER TABLE `invoice_taxe`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `invoice_types`
--
ALTER TABLE `invoice_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `invoice_type_taxe`
--
ALTER TABLE `invoice_type_taxe`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `living_rooms`
--
ALTER TABLE `living_rooms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `modules`
--
ALTER TABLE `modules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `module_role`
--
ALTER TABLE `module_role`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `oauth_clients`
--
ALTER TABLE `oauth_clients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `oauth_personal_access_clients`
--
ALTER TABLE `oauth_personal_access_clients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `order_product`
--
ALTER TABLE `order_product`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `order_table`
--
ALTER TABLE `order_table`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `printers`
--
ALTER TABLE `printers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `product_addon`
--
ALTER TABLE `product_addon`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `product_bundles`
--
ALTER TABLE `product_bundles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `product_counts`
--
ALTER TABLE `product_counts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `product_favorites`
--
ALTER TABLE `product_favorites`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `product_price_lists`
--
ALTER TABLE `product_price_lists`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `product_promotion_detail`
--
ALTER TABLE `product_promotion_detail`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `product_purchase`
--
ALTER TABLE `product_purchase`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `product_ratings`
--
ALTER TABLE `product_ratings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `product_transfer_stock`
--
ALTER TABLE `product_transfer_stock`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `promotion_details`
--
ALTER TABLE `promotion_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `purchase_payments`
--
ALTER TABLE `purchase_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sections`
--
ALTER TABLE `sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `status_histories`
--
ALTER TABLE `status_histories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `stock_products`
--
ALTER TABLE `stock_products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `subscription_history`
--
ALTER TABLE `subscription_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tables`
--
ALTER TABLE `tables`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `taxes`
--
ALTER TABLE `taxes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `transfer_stocks`
--
ALTER TABLE `transfer_stocks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tutorials`
--
ALTER TABLE `tutorials`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `type_of_services`
--
ALTER TABLE `type_of_services`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `unit_of_measures`
--
ALTER TABLE `unit_of_measures`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `user_activity_logs`
--
ALTER TABLE `user_activity_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `versions`
--
ALTER TABLE `versions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `branch_offices`
--
ALTER TABLE `branch_offices`
  ADD CONSTRAINT `branch_offices_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `branch_offices_user_created_id_foreign` FOREIGN KEY (`user_created_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `branch_offices_user_updated_id_foreign` FOREIGN KEY (`user_updated_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `branch_office_category`
--
ALTER TABLE `branch_office_category`
  ADD CONSTRAINT `branch_office_category_branch_office_id_foreign` FOREIGN KEY (`branch_office_id`) REFERENCES `branch_offices` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `branch_office_category_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `branch_office_user`
--
ALTER TABLE `branch_office_user`
  ADD CONSTRAINT `branch_office_user_branch_office_id_foreign` FOREIGN KEY (`branch_office_id`) REFERENCES `branch_offices` (`id`),
  ADD CONSTRAINT `branch_office_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `bussine_types`
--
ALTER TABLE `bussine_types`
  ADD CONSTRAINT `bussine_types_user_created_id_foreign` FOREIGN KEY (`user_created_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bussine_types_user_updated_id_foreign` FOREIGN KEY (`user_updated_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `bussine_type_module`
--
ALTER TABLE `bussine_type_module`
  ADD CONSTRAINT `bussine_type_module_bussine_type_id_foreign` FOREIGN KEY (`bussine_type_id`) REFERENCES `bussine_types` (`id`),
  ADD CONSTRAINT `bussine_type_module_module_id_foreign` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`);

--
-- Filtros para la tabla `cashboxes`
--
ALTER TABLE `cashboxes`
  ADD CONSTRAINT `cashboxes_branch_office_id_foreign` FOREIGN KEY (`branch_office_id`) REFERENCES `branch_offices` (`id`),
  ADD CONSTRAINT `cashboxes_user_created_id_foreign` FOREIGN KEY (`user_created_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `cashboxes_user_updated_id_foreign` FOREIGN KEY (`user_updated_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `cashbox_user`
--
ALTER TABLE `cashbox_user`
  ADD CONSTRAINT `cashbox_user_cashbox_id_foreign` FOREIGN KEY (`cashbox_id`) REFERENCES `cashboxes` (`id`),
  ADD CONSTRAINT `cashbox_user_user_close_id_foreign` FOREIGN KEY (`user_close_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `cashbox_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `cashflows`
--
ALTER TABLE `cashflows`
  ADD CONSTRAINT `cashflows_cashbox_user_id_foreign` FOREIGN KEY (`cashbox_user_id`) REFERENCES `cashbox_user` (`id`);

--
-- Filtros para la tabla `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_printer_id_foreign` FOREIGN KEY (`printer_id`) REFERENCES `printers` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_business_type_id_foreign` FOREIGN KEY (`business_type_id`) REFERENCES `bussine_types` (`id`),
  ADD CONSTRAINT `companies_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `company_configs`
--
ALTER TABLE `company_configs`
  ADD CONSTRAINT `company_configs_printer_id_foreign` FOREIGN KEY (`printer_id`) REFERENCES `printers` (`id`);

--
-- Filtros para la tabla `countries`
--
ALTER TABLE `countries`
  ADD CONSTRAINT `countries_coin_id_foreign` FOREIGN KEY (`coin_id`) REFERENCES `coins` (`id`),
  ADD CONSTRAINT `countries_user_created_id_foreign` FOREIGN KEY (`user_created_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `countries_user_updated_id_foreign` FOREIGN KEY (`user_updated_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `counts`
--
ALTER TABLE `counts`
  ADD CONSTRAINT `counts_branch_office_id_foreign` FOREIGN KEY (`branch_office_id`) REFERENCES `branch_offices` (`id`),
  ADD CONSTRAINT `counts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `courier_locations`
--
ALTER TABLE `courier_locations`
  ADD CONSTRAINT `courier_locations_courier_id_foreign` FOREIGN KEY (`courier_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `courier_locations_delivery_run_id_foreign` FOREIGN KEY (`delivery_run_id`) REFERENCES `delivery_runs` (`id`);

--
-- Filtros para la tabla `delivery_runs`
--
ALTER TABLE `delivery_runs`
  ADD CONSTRAINT `delivery_runs_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `delivery_runs_courier_id_foreign` FOREIGN KEY (`courier_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `delivery_runs_origin_branch_id_foreign` FOREIGN KEY (`origin_branch_id`) REFERENCES `branch_offices` (`id`),
  ADD CONSTRAINT `delivery_runs_user_created_id_foreign` FOREIGN KEY (`user_created_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `delivery_runs_user_updated_id_foreign` FOREIGN KEY (`user_updated_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `delivery_run_events`
--
ALTER TABLE `delivery_run_events`
  ADD CONSTRAINT `delivery_run_events_actor_id_foreign` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `delivery_run_events_delivery_run_id_foreign` FOREIGN KEY (`delivery_run_id`) REFERENCES `delivery_runs` (`id`);

--
-- Filtros para la tabla `delivery_run_transfers`
--
ALTER TABLE `delivery_run_transfers`
  ADD CONSTRAINT `delivery_run_transfers_delivered_by_foreign` FOREIGN KEY (`delivered_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `delivery_run_transfers_delivery_run_id_foreign` FOREIGN KEY (`delivery_run_id`) REFERENCES `delivery_runs` (`id`),
  ADD CONSTRAINT `delivery_run_transfers_transfer_stock_id_foreign` FOREIGN KEY (`transfer_stock_id`) REFERENCES `transfer_stocks` (`id`);

--
-- Filtros para la tabla `exchange_rates`
--
ALTER TABLE `exchange_rates`
  ADD CONSTRAINT `exchange_rates_coin_id_foreign` FOREIGN KEY (`coin_id`) REFERENCES `coins` (`id`),
  ADD CONSTRAINT `exchange_rates_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);

--
-- Filtros para la tabla `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_cashbox_user_id_foreign` FOREIGN KEY (`cashbox_user_id`) REFERENCES `cashbox_user` (`id`);

--
-- Filtros para la tabla `invoice_delivery_locations`
--
ALTER TABLE `invoice_delivery_locations`
  ADD CONSTRAINT `invoice_delivery_locations_invoice_delivery_run_id_foreign` FOREIGN KEY (`invoice_delivery_run_id`) REFERENCES `invoice_delivery_runs` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `invoice_delivery_runs`
--
ALTER TABLE `invoice_delivery_runs`
  ADD CONSTRAINT `invoice_delivery_runs_branch_office_id_foreign` FOREIGN KEY (`branch_office_id`) REFERENCES `branch_offices` (`id`),
  ADD CONSTRAINT `invoice_delivery_runs_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `invoice_delivery_runs_delivery_person_id_foreign` FOREIGN KEY (`delivery_person_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `invoice_delivery_runs_user_created_id_foreign` FOREIGN KEY (`user_created_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `invoice_delivery_runs_user_updated_id_foreign` FOREIGN KEY (`user_updated_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `invoice_delivery_run_events`
--
ALTER TABLE `invoice_delivery_run_events`
  ADD CONSTRAINT `invoice_delivery_run_events_actor_id_foreign` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `invoice_delivery_run_events_invoice_delivery_run_id_foreign` FOREIGN KEY (`invoice_delivery_run_id`) REFERENCES `invoice_delivery_runs` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `invoice_delivery_run_items`
--
ALTER TABLE `invoice_delivery_run_items`
  ADD CONSTRAINT `invoice_delivery_run_items_delivered_by_foreign` FOREIGN KEY (`delivered_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `invoice_delivery_run_items_invoice_delivery_run_id_foreign` FOREIGN KEY (`invoice_delivery_run_id`) REFERENCES `invoice_delivery_runs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoice_delivery_run_items_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `invoice_discounts`
--
ALTER TABLE `invoice_discounts`
  ADD CONSTRAINT `invoice_discounts_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `invoice_product`
--
ALTER TABLE `invoice_product`
  ADD CONSTRAINT `invoice_product_product_promotion_detail_id_foreign` FOREIGN KEY (`product_promotion_detail_id`) REFERENCES `product_promotion_detail` (`id`),
  ADD CONSTRAINT `invoice_product_promotion_detail_id_foreign` FOREIGN KEY (`promotion_detail_id`) REFERENCES `promotion_details` (`id`),
  ADD CONSTRAINT `invoice_product_promotion_id_foreign` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`);

--
-- Filtros para la tabla `invoice_status_history`
--
ALTER TABLE `invoice_status_history`
  ADD CONSTRAINT `invoice_status_history_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoice_status_history_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `product_counts`
--
ALTER TABLE `product_counts`
  ADD CONSTRAINT `product_counts_count_id_foreign` FOREIGN KEY (`count_id`) REFERENCES `counts` (`id`),
  ADD CONSTRAINT `product_counts_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `product_counts_user_created_id_foreign` FOREIGN KEY (`user_created_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `product_favorites`
--
ALTER TABLE `product_favorites`
  ADD CONSTRAINT `product_favorites_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_favorites_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `product_price_lists`
--
ALTER TABLE `product_price_lists`
  ADD CONSTRAINT `product_price_lists_branch_office_id_foreign` FOREIGN KEY (`branch_office_id`) REFERENCES `branch_offices` (`id`),
  ADD CONSTRAINT `product_price_lists_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `product_price_lists_user_created_id_foreign` FOREIGN KEY (`user_created_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `product_price_lists_user_updated_id_foreign` FOREIGN KEY (`user_updated_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `product_promotion_detail`
--
ALTER TABLE `product_promotion_detail`
  ADD CONSTRAINT `product_promotion_detail_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `product_promotion_detail_promotion_detail_id_foreign` FOREIGN KEY (`promotion_detail_id`) REFERENCES `promotion_details` (`id`),
  ADD CONSTRAINT `product_promotion_detail_user_created_id_foreign` FOREIGN KEY (`user_created_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `product_promotion_detail_user_updated_id_foreign` FOREIGN KEY (`user_updated_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `product_ratings`
--
ALTER TABLE `product_ratings`
  ADD CONSTRAINT `product_ratings_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_ratings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `product_transfer_stock`
--
ALTER TABLE `product_transfer_stock`
  ADD CONSTRAINT `product_transfer_stock_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `product_transfer_stock_transfer_stock_id_foreign` FOREIGN KEY (`transfer_stock_id`) REFERENCES `transfer_stocks` (`id`);

--
-- Filtros para la tabla `promotions`
--
ALTER TABLE `promotions`
  ADD CONSTRAINT `promotions_user_created_id_foreign` FOREIGN KEY (`user_created_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `promotions_user_updated_id_foreign` FOREIGN KEY (`user_updated_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `promotion_details`
--
ALTER TABLE `promotion_details`
  ADD CONSTRAINT `promotion_details_promotion_id_foreign` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`),
  ADD CONSTRAINT `promotion_details_user_created_id_foreign` FOREIGN KEY (`user_created_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `promotion_details_user_updated_id_foreign` FOREIGN KEY (`user_updated_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `status_histories`
--
ALTER TABLE `status_histories`
  ADD CONSTRAINT `status_histories_user_created_id_foreign` FOREIGN KEY (`user_created_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `status_histories_user_updated_id_foreign` FOREIGN KEY (`user_updated_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subscriptions_subscription_plan_id_foreign` FOREIGN KEY (`subscription_plan_id`) REFERENCES `subscription_plans` (`id`);

--
-- Filtros para la tabla `subscription_history`
--
ALTER TABLE `subscription_history`
  ADD CONSTRAINT `subscription_history_subscription_id_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subscription_history_subscription_plan_id_foreign` FOREIGN KEY (`subscription_plan_id`) REFERENCES `subscription_plans` (`id`),
  ADD CONSTRAINT `subscription_history_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `transfer_stocks`
--
ALTER TABLE `transfer_stocks`
  ADD CONSTRAINT `transfer_stocks_accepted_by_foreign` FOREIGN KEY (`accepted_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `transfer_stocks_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `transfer_stocks_destination_branch_office_id_foreign` FOREIGN KEY (`destination_branch_office_id`) REFERENCES `branch_offices` (`id`),
  ADD CONSTRAINT `transfer_stocks_origin_branch_office_id_foreign` FOREIGN KEY (`origin_branch_office_id`) REFERENCES `branch_offices` (`id`),
  ADD CONSTRAINT `transfer_stocks_return_transfer_id_foreign` FOREIGN KEY (`return_transfer_id`) REFERENCES `transfer_stocks` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `transfer_stocks_user_created_id_foreign` FOREIGN KEY (`user_created_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `transfer_stocks_user_updated_id_foreign` FOREIGN KEY (`user_updated_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `transfer_stocks_verified_by_foreign` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `user_activity_logs`
--
ALTER TABLE `user_activity_logs`
  ADD CONSTRAINT `user_activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `versions`
--
ALTER TABLE `versions`
  ADD CONSTRAINT `versions_user_created_id_foreign` FOREIGN KEY (`user_created_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
