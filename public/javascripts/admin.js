const searchInput = document.getElementById('adminSearch');
const searchBtn = document.getElementById('adminSearchBtn');
const resultsDiv = document.getElementById('adminResults');

async function searchUsers(query) {
    const res = await fetch(`/admin/search?q=${encodeURIComponent(query)}`);
    const users = await res.json();

    resultsDiv.innerHTML = '';
    users.forEach(user => {
        const status = user.deleted_at ? 'Deleted' : 'Active';
        const isAdmin = user.admin === 'true';

        const card = document.createElement('div');
        card.className = 'admin-player-listing';

        card.innerHTML = `
        <div class="admin-info-row">
            <div class="admin-user-info">
                <div class="player-name">${user.username}</div>
                <div>Status: <strong>${status}</strong></div>
            </div>
            <div id="player-image">
                <img src="${user.img_path}" alt="No image" />
            </div>
            </div>
            <div class="admin-button-row">
            <form method="POST" action="/admin/${user.deleted_at ? 'recover' : 'soft-delete'}/${user.user_id}" onsubmit="return confirm('Are you sure you would like to delete this account?')">
                <button class="admin-button" type="submit">${user.deleted_at ? 'Recover Account' : 'Delete Account'}</button>
            </form>
            <form method="POST" action="/admin/delete/${user.user_id}" onsubmit="return confirm('Are you sure you would like to permanently remove this account from the database?')">
                <button class="admin-button" type="submit">Remove Permanently</button>
            </form>
            <form method="POST" action="/admin/${isAdmin ? 'remove-admin' : 'make-admin'}/${user.user_id}" onsubmit="return confirm('Are you sure you want to ${isAdmin ? 'remove this admin' : 'make this user an admin'}?')">
                <button class="admin-button" type="submit">${isAdmin ? 'Remove Admin' : 'Make Admin'}</button>
            </form>
        </div>
        `;

        resultsDiv.appendChild(card);
    });
}

searchBtn.addEventListener('click', () => {
    const q = searchInput.value;
    if (q) searchUsers(q);
});

searchInput.addEventListener('input', () => {
    const q = searchInput.value;
    if (q) searchUsers(q);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchUsers(searchInput.value);
    }
});