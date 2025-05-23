CREATE TABLE IF NOT EXISTS statistics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(255),
    metric_value DECIMAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
