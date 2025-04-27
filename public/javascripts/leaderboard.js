document.querySelectorAll('.clickable-row').forEach(row => {
    row.addEventListener('click', function() {
        const userId = this.getAttribute('data-user-id');
        window.location.href = `/profile/${userId}`;
    });
});

