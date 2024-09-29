-- Crear tabla de tipos de usuarios
CREATE TABLE IF NOT EXISTS user_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL
);

-- Crear tabla de usuarios sin la función uuid_generate_v4(), ya que se genera en la API
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    user_type_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_type_id) REFERENCES user_types(id) ON DELETE SET NULL
);

-- Insertar tipos de usuarios por defecto
INSERT INTO user_types (type_name) VALUES ('regular'), ('administrador')
ON CONFLICT DO NOTHING;

-- Crear tabla de películas
CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    director VARCHAR(255),
    genres VARCHAR(255),
    score DECIMAL(3, 2) CHECK (score >= 0 AND score <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
