<?php
declare(strict_types=1);

// Handles every form submission (create, update, delete, toggle, switch user),
// then redirects back to the page (Post/Redirect/Get).

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    return;
}

$action = (string) ($_POST['action'] ?? '');
$page   = current_page();

if (!verify_csrf()) {
    flash('error', 'Your session expired. Please try again.');
    redirect(page_url($page));
}

$user   = current_user();
$userId = (int) $user['id'];

switch ($action) {
    case 'switch_user':
        $newId = (int) ($_POST['user_id'] ?? 0);

        foreach (get_users() as $candidate) {
            if ((int) $candidate['id'] === $newId) {
                $_SESSION['user_id'] = $newId;
                flash('success', 'Now signed in as ' . $candidate['name'] . '.');
                break;
            }
        }

        redirect(page_url($page));

    case 'create':
        [$data, $errors] = validate_task_input($_POST);

        $upload = ['filename' => null, 'error' => null];
        if ($errors === []) {
            $upload = handle_image_upload($_FILES['image'] ?? null);
            if ($upload['error'] !== null) {
                $errors[] = $upload['error'];
            }
        }

        if ($errors !== []) {
            $_SESSION['old']    = $_POST;
            $_SESSION['errors'] = $errors;
            redirect(page_url($page));
        }

        $statement = db()->prepare(
            'INSERT INTO tasks (user_id, title, tag, deadline, description, image, is_shared)
             VALUES (:user_id, :title, :tag, :deadline, :description, :image, :is_shared)'
        );
        $statement->execute($data + ['user_id' => $userId, 'image' => $upload['filename']]);
        $newId = (int) db()->lastInsertId();

        flash('success', 'Task "' . $data['title'] . '" was added.');
        redirect(page_url($data['is_shared'] === 1 ? 'shared' : 'personal', ['id' => $newId]));

    case 'update':
        $id   = (int) ($_POST['id'] ?? 0);
        $task = get_task($id);

        if ($task === null || !can_modify($task, $userId)) {
            flash('error', 'Task not found, or you are not allowed to change it.');
            redirect(page_url($page));
        }

        [$data, $errors] = validate_task_input($_POST);

        $upload = ['filename' => null, 'error' => null];
        if ($errors === []) {
            $upload = handle_image_upload($_FILES['image'] ?? null);
            if ($upload['error'] !== null) {
                $errors[] = $upload['error'];
            }
        }

        if ($errors !== []) {
            $_SESSION['old']    = $_POST;
            $_SESSION['errors'] = $errors;
            redirect(page_url($page, ['edit' => $id]));
        }

        $image = $task['image'];

        if ($upload['filename'] !== null) {
            delete_image($task['image']);
            $image = $upload['filename'];
        } elseif (isset($_POST['remove_image'])) {
            delete_image($task['image']);
            $image = null;
        }

        $statement = db()->prepare(
            'UPDATE tasks
             SET title = :title, tag = :tag, deadline = :deadline, description = :description,
                 image = :image, is_shared = :is_shared
             WHERE id = :id AND user_id = :user_id'
        );
        $statement->execute($data + ['image' => $image, 'id' => $id, 'user_id' => $userId]);

        flash('success', 'Task "' . $data['title'] . '" was updated.');
        redirect(page_url($data['is_shared'] === 1 ? 'shared' : 'personal', ['id' => $id]));

    case 'toggle':
        $id   = (int) ($_POST['id'] ?? 0);
        $task = get_task($id);

        if ($task === null || !can_modify($task, $userId)) {
            flash('error', 'Task not found, or you are not allowed to change it.');
            redirect(page_url($page));
        }

        $statement = db()->prepare('UPDATE tasks SET is_done = 1 - is_done WHERE id = :id AND user_id = :user_id');
        $statement->execute(['id' => $id, 'user_id' => $userId]);

        flash('success', 'Task "' . $task['title'] . '" marked as ' . ((int) $task['is_done'] === 1 ? 'not done.' : 'done.'));
        redirect(page_url($page, ['id' => $id]));

    case 'delete':
        $id   = (int) ($_POST['id'] ?? 0);
        $task = get_task($id);

        if ($task === null || !can_modify($task, $userId)) {
            flash('error', 'Task not found, or you are not allowed to delete it.');
            redirect(page_url($page));
        }

        delete_image($task['image']);
        $statement = db()->prepare('DELETE FROM tasks WHERE id = :id AND user_id = :user_id');
        $statement->execute(['id' => $id, 'user_id' => $userId]);

        flash('success', 'Task "' . $task['title'] . '" was deleted.');
        redirect(page_url($page));

    default:
        flash('error', 'Unknown action.');
        redirect(page_url($page));
}
