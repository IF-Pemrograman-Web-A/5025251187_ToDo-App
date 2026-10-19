        <main id="main-content" class="main-area" tabindex="-1">
            <?php if ($flash !== null): ?>
                <div class="flash flash-<?= e($flash['type']) ?>" role="<?= $flash['type'] === 'error' ? 'alert' : 'status' ?>">
                    <?= e($flash['message']) ?>
                </div>
            <?php endif; ?>

            <div class="container">
                <?php include __DIR__ . '/task-form.php'; ?>
                <?php include __DIR__ . '/task-list.php'; ?>
                <?php include __DIR__ . '/task-detail.php'; ?>
            </div>
        </main>
