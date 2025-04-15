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

CREATE EVENT IF NOT EXISTS delete_expired_tokens
ON SCHEDULE EVERY 1 MINUTE
DO
  DELETE FROM password_reset WHERE expire_datetime < (NOW() - INTERVAL 15 MINUTE);
