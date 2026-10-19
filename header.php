<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Organizational to-do list with personal and shared tasks.">
    <title><?= $page === 'shared' ? 'Shared' : 'Personal' ?> Tasks - My To Do</title>
    <link rel="stylesheet" href="style.css">
    <script src="script.js" defer></script>
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
            <button type="button" id="theme-toggle" class="btn-theme">Dark Mode</button>
        </div>
    </header>

    <div class="layout">
