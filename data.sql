-- Todo App E04 - database structure and dummy data
-- Import this file with phpMyAdmin (Import tab) or:  mysql -u root < data.sql

CREATE DATABASE IF NOT EXISTS todo_app
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE todo_app;

DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name       VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tasks (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED NOT NULL,
    title       VARCHAR(150) NOT NULL,
    tag         VARCHAR(50)  NOT NULL DEFAULT '',
    deadline    DATE NULL,
    description TEXT NOT NULL,
    image       VARCHAR(255) NULL,
    is_shared   TINYINT(1) NOT NULL DEFAULT 0,
    is_done     TINYINT(1) NOT NULL DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_tasks_user (user_id),
    KEY idx_tasks_shared (is_shared),
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (id, name) VALUES
    (1, 'Farrel'),
    (2, 'Dinda'),
    (3, 'Raka');

INSERT INTO tasks (user_id, title, tag, deadline, description, image, is_shared, is_done) VALUES
    (1, 'Finish Web Programming E04',      'Pemweb', '2026-10-26', 'Migrate the todo app to PHP, connect it to MySQL, and add the Personal and Shared menu.', NULL, 0, 0),
    (1, 'Study Uninformed Search',         'KKA',    '2026-10-22', 'Review BFS, DFS, UCS, and iterative deepening before the next meeting.', NULL, 0, 0),
    (1, 'Discrete Math Assignment 3',      'Matdis', '2026-10-24', 'Solve the graph and counting problems from ITS Classroom.', NULL, 0, 1),
    (1, 'Continue the AI Engine notebook', 'KCV',    '2026-10-30', 'Finish the remaining cells of the notebook and test the pipeline.', NULL, 0, 0),
    (2, 'Prepare organization meeting',    'Org',    '2026-10-21', 'Prepare the agenda and meeting notes for the weekly organization meeting.', NULL, 1, 0),
    (2, 'Design event poster',             'Org',    '2026-10-28', 'Draft two poster options for the upcoming event and share them for feedback.', NULL, 1, 0),
    (3, 'Book the room for the workshop',  'Org',    '2026-10-23', 'Confirm the room reservation and the projector for the workshop.', NULL, 1, 1),
    (1, 'Collect team feedback form',      'Org',    '2026-10-29', 'Gather responses from the team and summarize them in one page.', NULL, 1, 0),
    (3, 'Read the networking module',      'Jarkom', '2026-10-25', 'Read the new module before the practicum.', NULL, 0, 0);
