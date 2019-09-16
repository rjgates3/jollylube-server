ALTER TABLE appt_times
    ADD COLUMN
        user_id INTEGER REFERENCES users(id)
        on DELETE SET NULL;