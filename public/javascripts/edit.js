document.getElementById('deleteButton').addEventListener('click', function(event) {
    event.preventDefault();

    if (confirm('Are you sure you want to delete your account? This action is irreversible.')) {
        document.getElementById('deleteForm').submit();
    }
});
const profileImageSelect = document.getElementById('profileImage');
const profilePreview = document.getElementById('profilePreview');

profileImageSelect.addEventListener('change', function () {
    const selectedImage = this.value;
    profilePreview.src = selectedImage;
});

