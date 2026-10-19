<?php
declare(strict_types=1);

// Database settings (default XAMPP / Laragon: user "root" with empty password)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'todo_app');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');

// File handling settings
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('UPLOAD_URL', 'uploads/');
define('MAX_UPLOAD_BYTES', 2 * 1024 * 1024);

session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
session_start();

function db(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        try {
            $pdo = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]
            );
        } catch (PDOException $exception) {
            http_response_code(500);
            echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Database error</title></head><body>';
            echo '<h1>Cannot connect to the database</h1>';
            echo '<p>Make sure MySQL is running, <code>data.sql</code> has been imported, and the settings in <code>config.php</code> are correct.</p>';
            echo '</body></html>';
            exit;
        }
    }

    return $pdo;
}
