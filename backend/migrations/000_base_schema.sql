CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'employee',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    department_id INT REFERENCES departments(id),
    phone VARCHAR(20),
    address TEXT,
    designation VARCHAR(100),
    salary NUMERIC(12,2),
    status VARCHAR(30) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS employee_skills (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employee_profiles(id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
    proficiency VARCHAR(30) DEFAULT 'Intermediate',
    UNIQUE(employee_id, skill_id)
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100),
    description TEXT,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO departments (department_name) VALUES
('Engineering'), ('Human Resources'), ('Finance & Ops'), ('Product Design'), ('Product Management')
ON CONFLICT (department_name) DO NOTHING;

INSERT INTO skills (skill_name) VALUES
('React'), ('Node.js'), ('PostgreSQL'), ('Docker'), ('Figma'), ('AWS')
ON CONFLICT (skill_name) DO NOTHING;