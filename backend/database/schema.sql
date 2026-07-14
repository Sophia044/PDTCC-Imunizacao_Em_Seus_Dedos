-- ============================================================
-- VacinApp - Esqueleto inicial do banco de dados MySQL
-- Projeto: Imunizacao em Seus Dedos
-- ============================================================

CREATE DATABASE IF NOT EXISTS vacinapp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vacinapp;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS public_queue;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS vaccination_records;
DROP TABLE IF EXISTS professional_health_units;
DROP TABLE IF EXISTS health_unit_users;
DROP TABLE IF EXISTS vaccines;
DROP TABLE IF EXISTS health_units;
DROP TABLE IF EXISTS professionals;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- Usuarios base do sistema: pacientes, profissionais e admins.
-- A senha deve ser armazenada como hash gerado pelo backend.
-- ------------------------------------------------------------
CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(180) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('patient', 'professional', 'admin') NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Pacientes da rede publica e privada.
-- public: usa CNS/SUS.
-- private: usa convenio e numero da carteirinha.
-- ------------------------------------------------------------
CREATE TABLE patients (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  cpf CHAR(11) NOT NULL,
  birth_date DATE NOT NULL,
  phone VARCHAR(20) NULL,
  network_type ENUM('public', 'private') NOT NULL,
  sus_number CHAR(15) NULL,
  health_plan VARCHAR(120) NULL,
  health_plan_card VARCHAR(80) NULL,
  blood_type VARCHAR(3) NULL,
  allergies TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_patients_user_id (user_id),
  UNIQUE KEY uq_patients_cpf_network (cpf, network_type),
  UNIQUE KEY uq_patients_sus_number (sus_number),
  KEY idx_patients_network_type (network_type),
  CONSTRAINT fk_patients_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT chk_patients_public_or_private
    CHECK (
      (network_type = 'public' AND sus_number IS NOT NULL)
      OR
      (network_type = 'private' AND health_plan IS NOT NULL AND health_plan_card IS NOT NULL)
    )
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Profissionais de saude.
-- O backend pode determinar o papel pelo conselho/registro.
-- ------------------------------------------------------------
CREATE TABLE professionals (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  cpf CHAR(11) NULL,
  council_type ENUM('CRM', 'COREN', 'OTHER') NOT NULL,
  professional_registry VARCHAR(40) NOT NULL,
  specialty VARCHAR(120) NULL,
  network_type ENUM('public', 'private') NOT NULL,
  verification_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_professionals_user_id (user_id),
  UNIQUE KEY uq_professionals_registry (council_type, professional_registry),
  KEY idx_professionals_network_type (network_type),
  CONSTRAINT fk_professionals_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- UBS, postos, clinicas, hospitais e centros de imunizacao.
-- CNES e obrigatorio para unidade publica.
-- ------------------------------------------------------------
CREATE TABLE health_units (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(180) NOT NULL,
  type ENUM('public', 'private') NOT NULL,
  cnes CHAR(7) NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL,
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  opening_hours VARCHAR(120) NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_health_units_cnes (cnes),
  KEY idx_health_units_type (type),
  CONSTRAINT chk_health_units_public_cnes
    CHECK ((type = 'public' AND cnes IS NOT NULL) OR type = 'private')
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Usuarios institucionais da unidade, como recepcao/triagem.
-- Usado pela tela "Entrar como Unidade de Saude".
-- ------------------------------------------------------------
CREATE TABLE health_unit_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  health_unit_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(180) NOT NULL,
  registration_number VARCHAR(40) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('triage', 'manager') NOT NULL DEFAULT 'triage',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_health_unit_users_email (email),
  UNIQUE KEY uq_health_unit_users_registration (health_unit_id, registration_number),
  CONSTRAINT fk_health_unit_users_health_unit
    FOREIGN KEY (health_unit_id) REFERENCES health_units (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Vinculo entre profissional e unidade onde atua.
-- Permite um profissional trabalhar em mais de uma instituicao.
-- ------------------------------------------------------------
CREATE TABLE professional_health_units (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  professional_id BIGINT UNSIGNED NOT NULL,
  health_unit_id BIGINT UNSIGNED NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_professional_health_unit (professional_id, health_unit_id),
  KEY idx_phu_health_unit (health_unit_id),
  CONSTRAINT fk_phu_professional
    FOREIGN KEY (professional_id) REFERENCES professionals (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_phu_health_unit
    FOREIGN KEY (health_unit_id) REFERENCES health_units (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Catalogo de vacinas disponiveis no sistema.
-- ------------------------------------------------------------
CREATE TABLE vaccines (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  disease VARCHAR(160) NULL,
  description TEXT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vaccines_name (name)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Carteira digital real: registros aplicados por profissional.
-- Pendencias e atrasos devem ser calculados pelo backend depois.
-- ------------------------------------------------------------
CREATE TABLE vaccination_records (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  vaccine_id BIGINT UNSIGNED NOT NULL,
  professional_id BIGINT UNSIGNED NOT NULL,
  health_unit_id BIGINT UNSIGNED NOT NULL,
  dose VARCHAR(60) NULL,
  manufacturer VARCHAR(120) NULL,
  lot VARCHAR(80) NULL,
  application_date DATE NOT NULL,
  notes TEXT NULL,
  network_type ENUM('public', 'private') NOT NULL,
  status ENUM('valid', 'cancelled', 'corrected') NOT NULL DEFAULT 'valid',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_vaccination_records_patient_date (patient_id, application_date),
  KEY idx_vaccination_records_vaccine (vaccine_id),
  KEY idx_vaccination_records_professional (professional_id),
  KEY idx_vaccination_records_health_unit (health_unit_id),
  CONSTRAINT fk_vaccination_records_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_vaccination_records_vaccine
    FOREIGN KEY (vaccine_id) REFERENCES vaccines (id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_vaccination_records_professional
    FOREIGN KEY (professional_id) REFERENCES professionals (id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_vaccination_records_health_unit
    FOREIGN KEY (health_unit_id) REFERENCES health_units (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Agenda de vacinacao, principalmente para rede privada.
-- ------------------------------------------------------------
CREATE TABLE appointments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  professional_id BIGINT UNSIGNED NULL,
  health_unit_id BIGINT UNSIGNED NOT NULL,
  vaccine_id BIGINT UNSIGNED NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status ENUM('scheduled', 'done', 'missed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_appointments_patient_date (patient_id, appointment_date),
  KEY idx_appointments_professional_date (professional_id, appointment_date),
  KEY idx_appointments_health_unit_date (health_unit_id, appointment_date),
  CONSTRAINT fk_appointments_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_appointments_professional
    FOREIGN KEY (professional_id) REFERENCES professionals (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_appointments_health_unit
    FOREIGN KEY (health_unit_id) REFERENCES health_units (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_appointments_vaccine
    FOREIGN KEY (vaccine_id) REFERENCES vaccines (id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Fila de atendimento da unidade publica.
-- ------------------------------------------------------------
CREATE TABLE public_queue (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  health_unit_id BIGINT UNSIGNED NOT NULL,
  reason VARCHAR(160) NOT NULL DEFAULT 'Vacinacao',
  arrival_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('waiting', 'called', 'done', 'cancelled') NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_public_queue_unit_status_time (health_unit_id, status, arrival_time),
  KEY idx_public_queue_patient (patient_id),
  CONSTRAINT fk_public_queue_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_public_queue_health_unit
    FOREIGN KEY (health_unit_id) REFERENCES health_units (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
