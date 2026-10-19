        <aside class="sidebar">
            <nav aria-label="Main menu">
                <ul class="nav-list">
                    <li>
                        <a class="nav-link<?= $page === 'personal' ? ' active' : '' ?>"
                           href="<?= e(page_url('personal')) ?>"<?= $page === 'personal' ? ' aria-current="page"' : '' ?>>
                            <span>Personal</span>
                            <span class="count"><?= $counts['personal'] ?></span>
                        </a>
                    </li>
                    <li>
                        <a class="nav-link<?= $page === 'shared' ? ' active' : '' ?>"
                           href="<?= e(page_url('shared')) ?>"<?= $page === 'shared' ? ' aria-current="page"' : '' ?>>
                            <span>Shared</span>
                            <span class="count"><?= $counts['shared'] ?></span>
                        </a>
                    </li>
                </ul>
            </nav>

            <form method="post" action="index.php" class="user-switch">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="switch_user">
                <input type="hidden" name="page" value="<?= e($page) ?>">
                <label for="user-select">Signed in as</label>
                <select id="user-select" name="user_id">
                    <?php foreach ($users as $option): ?>
                        <option value="<?= (int) $option['id'] ?>"<?= (int) $option['id'] === $userId ? ' selected' : '' ?>><?= e($option['name']) ?></option>
                    <?php endforeach; ?>
                </select>
                <button type="submit" class="btn btn-secondary">Switch</button>
            </form>
        </aside>

