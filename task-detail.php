<section class="panel detail-panel" aria-labelledby="detail-heading">
    <h2 id="detail-heading">Task Details</h2>

    <?php if ($selected === null): ?>
        <p class="empty-message">Click a task in the list to see its details.</p>
    <?php else: ?>
        <article class="detail-card">
            <h3><?= e($selected['title']) ?></h3>
            <dl>
                <dt>Tag</dt>
                <dd><?= $selected['tag'] !== '' ? e($selected['tag']) : '-' ?></dd>
                <dt>Status</dt>
                <dd><?= (int) $selected['is_done'] === 1 ? 'Done' : 'Not done' ?></dd>
                <dt>Due</dt>
                <dd><?= e(format_date($selected['deadline'], true)) ?></dd>
                <dt>Owner</dt>
                <dd><?= e($selected['owner_name']) ?></dd>
                <dt>Visibility</dt>
                <dd><?= (int) $selected['is_shared'] === 1 ? 'Shared' : 'Personal' ?></dd>
            </dl>

            <p class="description"><?= $selected['description'] !== '' ? e($selected['description']) : 'No description.' ?></p>

            <?php if ($selected['image'] !== null): ?>
                <img class="detail-image" src="<?= e(UPLOAD_URL . $selected['image']) ?>" alt="Image attached to <?= e($selected['title']) ?>">
            <?php endif; ?>
        </article>
    <?php endif; ?>
</section>
