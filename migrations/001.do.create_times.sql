CREATE TABLE appt_times (
    id SERIAL PRIMARY KEY,
    appt_date TIMESTAMPTZ NOT NULL,
    available BOOL default NULL
)