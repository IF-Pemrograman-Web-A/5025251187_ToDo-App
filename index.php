<?php
declare(strict_types=1);

require __DIR__ . '/config.php';
require __DIR__ . '/functions.php';
require __DIR__ . '/actions.php';

$page   = current_page();
$user   = current_user();
$userId = (int) $user['id'];
$users  = get_users();
$counts = count_tasks($userId);
$tasks  = get_tasks($page, $userId);

$selected = null;
if (isset($_GET['id'])) {
    $candidate = get_task((int) $_GET['id']);
    if ($candidate !== null && task_in_page($candidate, $page, $userId)) {
        $selected = $candidate;
    }
}

$editing = null;
if (isset($_GET['edit'])) {
    $candidate = get_task((int) $_GET['edit']);
    if ($candidate !== null && task_in_page($candidate, $page, $userId) && can_modify($candidate, $userId)) {
        $editing = $candidate;
    }
}

$flash  = pull_session('flash');
$errors = pull_session('errors') ?? [];
$old    = pull_session('old');

if ($old !== null) {
    $form = [
        'title'       => (string) ($old['title'] ?? ''),
        'tag'         => (string) ($old['tag'] ?? ''),
        'deadline'    => (string) ($old['deadline'] ?? ''),
        'description' => (string) ($old['description'] ?? ''),
        'is_shared'   => isset($old['is_shared']),
    ];
} elseif ($editing !== null) {
    $form = [
        'title'       => $editing['title'],
        'tag'         => $editing['tag'],
        'deadline'    => (string) $editing['deadline'],
        'description' => $editing['description'],
        'is_shared'   => (int) $editing['is_shared'] === 1,
    ];
} else {
    $form = ['title' => '', 'tag' => '', 'deadline' => '', 'description' => '', 'is_shared' => $page === 'shared'];
}

include __DIR__ . '/header.php';
include __DIR__ . '/menu-bar.php';
include __DIR__ . '/content.php';
include __DIR__ . '/footer.php';
