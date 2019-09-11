ALTER TABLE apt_times
    ADD COLUMN
        user_id INTEGER REFERENCES users(id)
        on DELETE SET NULL;