CREATE DATABASE IF NOT EXISTS sims_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sims_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('user','team_lead','officer','admin') DEFAULT 'user',
  avatar VARCHAR(500),
  student_id VARCHAR(50),
  bio TEXT,
  contact_info VARCHAR(255),
  year_level VARCHAR(50),
  section VARCHAR(50),
  gender VARCHAR(20),
  birthdate DATE,
  team_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  score INT DEFAULT 0,
  merits JSON,
  demerits JSON,
  event_scores JSON,
  detailed_progress_history JSON,
  unit_leader INT,
  unit_secretary INT,
  unit_treasurer INT,
  unit_errands JSON,
  adviser INT,
  facilitators JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  date DATE,
  criteria JSON,
  results JSON,
  competition_points JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_event_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT,
  event_id INT,
  raw_score FLOAT,
  placement INT,
  competition_points INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE points (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT,
  type ENUM('merit','demerit'),
  reason TEXT,
  points INT,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('report','suggestion'),
  description TEXT,
  submitted_by INT,
  status ENUM('pending','reviewed','resolved') DEFAULT 'pending',
  replies JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  body TEXT,
  target_roles JSON,
  target_team_id INT,
  target_user_id INT,
  meta JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_join_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT,
  user_id INT,
  message TEXT,
  status ENUM('pending','accepted','rejected') DEFAULT 'pending',
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_settings (
  `key` VARCHAR(100) PRIMARY KEY,
  `value` JSON,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);