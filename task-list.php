<section class="panel list-panel" aria-labelledby="list-heading">
    <h2 id="list-heading"><?= $page === 'shared' ? 'Shared Tasks' : 'Personal Tasks' ?></h2>

    <?php if ($tasks === []): ?>
        <p class="empty-message">
            <?= $page === 'shared' ? 'No shared tasks yet.' : 'No personal tasks yet. Add one using the form.' ?>
        </p>
    <?php else: ?>
        <ul class="todo-list">
            <?php foreach ($tasks as $task):
                $isOwner    = can_modify($task, $userId);
                $isSelected = $selected !== null && (int) $selected['id'] === (int) $task['id'];
                $isDone     = (int) $task['is_done'] === 1;
            ?>
                <li class="task<?= $isDone ? ' done' : '' ?><?= $isSelected ? ' selected' : '' ?>">
                    <div class="task-title">
                        <form method="post" action="index.php" class="toggle-form">
                            <?= csrf_field() ?>
                            <input type="hidden" name="action" value="toggle">
                            <input type="hidden" name="page" value="<?= e($page) ?>">
                            <input type="hidden" name="id" value="<?= (int) $task['id'] ?>">
                            <input type="checkbox" id="done-<?= (int) $task['id'] ?>" class="js-toggle"<?= $isDone ? ' checked' : '' ?><?= $isOwner ? '' : ' disabled' ?>>
                            <label for="done-<?= (int) $task['id'] ?>" class="sr-only">Mark "<?= e($task['title']) ?>" as complete</label>
                            <noscript><button type="submit" class="btn-small btn-done">Toggle</button></noscript>
                        </form>

                        <a class="task-name" href="<?= e(page_url($page, ['id' => $task['id']])) ?>"<?= $isSelected ? ' aria-current="true"' : '' ?>><?= e($task['title']) ?></a>
                    </div>

                    <div class="task-meta">
                        <?php if ($task['tag'] !== ''): ?>
                            <span class="tag"><?= e($task['tag']) ?></span>
                        <?php endif; ?>
                        <span>Deadline: <?= e(format_date($task['deadline'])) ?></span>
                        <?php if ($page === 'shared'): ?>
                            <span>By <?= e($task['owner_name']) ?></span>
                        <?php endif; ?>
                        <?php if ($task['image'] !== null): ?>
                            <span>Has image</span>
                        <?php endif; ?>
                    </div>

                    <?php if ($isOwner): ?>
                        <div class="task-actions">
                            <a class="btn-small btn-edit" href="<?= e(page_url($page, ['edit' => $task['id']])) ?>" aria-label="Edit task: <?= e($task['title']) ?>">Edit</a>
                            <form method="post" action="index.php" class="inline-form js-confirm" data-confirm="Delete &quot;<?= e($task['title']) ?>&quot;?">
                                <?= csrf_field() ?>
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="page" value="<?= e($page) ?>">
                                <input type="hidden" name="id" value="<?= (int) $task['id'] ?>">
                                <button type="submit" class="btn-small btn-delete" aria-label="Delete task: <?= e($task['title']) ?>">Delete</button>
                            </form>
                        </div>
                    <?php endif; ?>
                </li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
</section>
