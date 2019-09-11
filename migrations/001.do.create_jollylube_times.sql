CREATE TABLE apt_times (
    id SERIAL PRIMARY KEY,
    apt_date TIMESTAMPTZ NOT NULL,
    avaliable TEXT default NULL
)