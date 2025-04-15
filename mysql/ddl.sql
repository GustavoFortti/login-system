CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  family_name VARCHAR(255),
  picture VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  is_google_account BOOLEAN DEFAULT FALSE,
  valid_user BOOLEAN DEFAULT FALSE,
  date_of_birth VARCHAR(255) DEFAULT NULL,
  creation_date VARCHAR(255),
  last_location VARCHAR(255),
  refresh_token TEXT
);

CREATE TABLE email_validation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  email_change_link VARCHAR(255) NOT NULL,
  expire_datetime DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE password_reset (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  expire_datetime DATETIME NOT NULL,
  password_change_link VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE weddings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wedding_name VARCHAR(255),
  wedding_date DATE,
  number_of_guests INT,
  paid BOOLEAN,
  confirm_guests BOOLEAN,
  paid_code VARCHAR(255),
  paid_date DATETIME,
  pix_reset_code VARCHAR(255),
  pix_user_code VARCHAR(255),
  wedding_code VARCHAR(255),
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE guests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  user_id INT,
  wedding_id INT,
  pending_access BOOLEAN,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE
);

CREATE TABLE gifts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wedding_id INT,
  guest_id INT,
  name VARCHAR(255),
  price VARCHAR(255),
  shop_url VARCHAR(255),
  payment_date DATETIME,
  image_url VARCHAR(255),
  confirm_receipt BOOLEAN,
  proof_receipt TEXT,
  guest_message TEXT,
  FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
);

CREATE TABLE pix_reset (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  wedding_id INT,
  email_code VARCHAR(255),
  expire_date DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  wedding_id INT,
  paid_code VARCHAR(255),
  paid_date DATETIME,
  wedding_name VARCHAR(255),
  wedding_date DATE,
  number_of_guests INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE
);

-- Ativação do event scheduler pode ser feita via comando no container ou no my.cnf
-- SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS delete_expired_tokens
ON SCHEDULE EVERY 1 MINUTE
DO
  DELETE FROM password_reset WHERE expire_datetime < (NOW() - INTERVAL 15 MINUTE);
