CREATE TABLE apt_times (
    id SERIAL PRIMARY KEY,
    apt_date TIMESTAMPTZ NOT NULL,
    available TEXT default NULL
)