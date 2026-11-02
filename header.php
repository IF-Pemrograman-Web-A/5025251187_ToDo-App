<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Organizational to-do list with personal and shared tasks.">
    <title><?= $page === 'shared' ? 'Shared' : 'Personal' ?> Tasks - My To Do</title>
    <meta name="theme-color" content="#2563eb">
    <link rel="manifest" href="manifest.webmanifest">
    <link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
    <link rel="apple-touch-icon" href="icons/icon-192.png">
    <link rel="stylesheet" href="style.css">
    <script src="app.js" defer></script>
</head>
<body>
    <script>
        try {
            if (localStorage.getItem('todo-theme') === 'dark') {
                document.body.classList.add('dark-mode');
            }
        } catch (error) {}
    </script>

    <a class="skip-link" href="#main-content">Skip to main content</a>

    <header class="app-header">
        <h1>My To Do Webpage</h1>
        <div class="header-actions">
            <button type="button" id="install-btn" class="btn-theme" hidden>Install App</button>
            <button type="button" id="theme-toggle" class="btn-theme">Dark Mode</button>
        </div>
    </header>

    <p id="net-status" class="net-status" role="status" hidden>Kamu sedang offline. Menampilkan data yang tersimpan, perubahan baru belum bisa disimpan.</p>
    <div id="status" class="sr-only" role="status" aria-live="polite"></div>

    <div class="layout">
