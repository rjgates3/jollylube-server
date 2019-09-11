BEGIN;

TRUNCATE
    users,
    apt_times
    RESTART IDENTITY CASCADE;

INSERT INTO users (user_name, full_name, password)
VALUES
    ('dunder', 'Dunder Mifflin', '$2a$12$lHK6LVpc15/ZROZcKU00QeiD.RyYq5dVlV/9m4kKYbGibkRc5l4Ne'),
    ('b.deboop', 'Bodeep Deboop', '$2a$12$VQ5HgWm34QQK2rJyLc0lmu59cy2jcZiV6U1.bE8rBBnC9VxDf/YQO'),
    ('c.bloggs', 'Charlie Bloggs', '$2a$12$2fv9OPgM07xGnhDbyL6xsuAeQjAYpZx/3V2dnu0XNIR27gTeiK2gK'),
    ('s.smith', 'Sam Smith', '$2a$12$/4P5/ylaB7qur/McgrEKwuCy.3JZ6W.cRtqxiJsYCdhr89V4Z3rp.'),
    ('lexlor', 'Alex Taylor', '$2a$12$Hq9pfcWWvnzZ8x8HqJotveRHLD13ceS7DDbrs18LpK6rfj4iftNw.'),
    ('wippy', 'Ping Won In', '$2a$12$ntGOlTLG5nEXYgDVqk4bPejBoJP65HfH2JEMc1JBpXaVjXo5RsTUu');