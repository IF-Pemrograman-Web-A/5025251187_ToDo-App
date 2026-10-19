<section class="panel form-panel" aria-labelledby="form-heading">
    <h2 id="form-heading"><?= $editing !== null ? 'Edit Task' : 'Create New Task' ?></h2>

    <?php if ($errors !== []): ?>
        <div class="flash flash-error" role="alert">
            <ul>
                <?php foreach ($errors as $message): ?>
                    <li><?= e($message) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <form method="post" action="index.php" enctype="multipart/form-data">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="<?= $editing !== null ? 'update' : 'create' ?>">
        <input type="hidden" name="page" value="<?= e($page) ?>">
        <?php if ($editing !== null): ?>
            <input type="hidden" name="id" value="<?= (int) $editing['id'] ?>">
        <?php endif; ?>

        <div class="form-group">
            <label for="title">Title <span class="required" aria-hidden="true">*</span><span class="sr-only">(required)</span></label>
            <input type="text" id="title" name="title" value="<?= e($form['title']) ?>" maxlength="150" required aria-required="true" autocomplete="off" placeholder="e.g. KKA - Uninformed Search">
        </div>

        <div class="form-group">
            <label for="tag">Tag</label>
            <input type="text" id="tag" name="tag" value="<?= e($form['tag']) ?>" maxlength="50" autocomplete="off" placeholder="e.g. KKA">
        </div>

        <div class="form-group">
            <label for="deadline">Deadline</label>
            <input type="date" id="deadline" name="deadline" value="<?= e($form['deadline']) ?>">
        </div>

        <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="description" rows="4" maxlength="2000" placeholder="Task description..."><?= e($form['description']) ?></textarea>
        </div>

        <div class="form-group check-group">
            <input type="checkbox" id="is_shared" name="is_shared" value="1"<?= $form['is_shared'] ? ' checked' : '' ?>>
            <label for="is_shared">Share with the organization</label>
        </div>

        <fieldset class="form-group image-field">
            <legend>Image (optional)</legend>
            <label for="image" class="file-label">Choose or take a photo (JPG, PNG, WEBP, GIF, max 2 MB)</label>
            <input type="file" id="image" name="image" accept="image/jpeg,image/png,image/webp,image/gif" capture="environment">

            <?php if ($editing !== null && $editing['image'] !== null): ?>
                <div class="image-preview-box">
                    <img src="<?= e(UPLOAD_URL . $editing['image']) ?>" alt="Current image attached to <?= e($editing['title']) ?>">
                    <div class="check-group">
                        <input type="checkbox" id="remove_image" name="remove_image" value="1">
                        <label for="remove_image">Remove current image</label>
                    </div>
                </div>
            <?php endif; ?>
        </fieldset>

        <div class="form-actions">
            <button type="submit" class="btn btn-primary"><?= $editing !== null ? 'Save Changes' : 'Add Todo' ?></button>
            <?php if ($editing !== null): ?>
                <a class="btn btn-secondary" href="<?= e(page_url($page, ['id' => $editing['id']])) ?>">Cancel</a>
            <?php endif; ?>
        </div>
    </form>
</section>
