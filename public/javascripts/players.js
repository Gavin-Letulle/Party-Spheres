const input = document.getElementById('playerInput');
const button = document.getElementById('searchPlayer');
const list = document.getElementById('playersList');

async function searchPlayers() {
    const query = input.value;
    const res = await fetch(`/players/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    list.innerHTML = '';

    data.forEach(player => {
        const link = document.createElement('a');
        link.href = `/profile/${player.user_id}`;
        link.className = 'player-listing';

        link.innerHTML = `
            <div class="player-name">${player.username}</div>
            <div id="player-image">
                <img src="${player.img_path || '/images/default-avatar.png'}" alt="No image">
            </div>
        `;

        list.appendChild(link);
    });
}

let debounceTimer;
input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(searchPlayers, 200);
});

button.addEventListener('click', searchPlayers);

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        searchPlayers();
    }
});
