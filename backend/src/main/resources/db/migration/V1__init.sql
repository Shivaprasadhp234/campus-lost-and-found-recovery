CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE item_reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  report_type VARCHAR(10) NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category_id BIGINT,
  general_location VARCHAR(150),
  event_date DATE,
  status VARCHAR(20) NOT NULL,
  created_by BIGINT NOT NULL,
  image_key VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_reports_user FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE claims (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  item_report_id BIGINT NOT NULL,
  claimant_id BIGINT NOT NULL,
  private_claim_details TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  reviewed_by BIGINT,
  review_note TEXT,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_claims_report FOREIGN KEY (item_report_id) REFERENCES item_reports(id),
  CONSTRAINT fk_claims_claimant FOREIGN KEY (claimant_id) REFERENCES users(id),
  CONSTRAINT fk_claims_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE INDEX idx_reports_type ON item_reports(report_type);
CREATE INDEX idx_reports_status ON item_reports(status);
CREATE INDEX idx_reports_category ON item_reports(category_id);
CREATE INDEX idx_claims_report ON claims(item_report_id);
CREATE INDEX idx_claims_status ON claims(status);
