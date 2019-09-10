ALTER TABLE jollylube_times
    ADD COLUMN
        userid INTEGER REFERENCES jollylube_users(id)
        on DELETE SET NULL;