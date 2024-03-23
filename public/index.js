document.addEventListener('DOMContentLoaded', function () {
    const modal = document.querySelector('.modal');
    const deleteButtons = document.querySelectorAll('.trash-button');

    deleteButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const projectId = this.getAttribute('data-project-id');
            modal.style.display = 'block';

            document.getElementById('cancelDelete').onclick = function () {
                modal.style.display = 'none';
            }

            document.getElementById('confirmDelete').onclick = function () {
                window.location.href = '/delete/' + projectId; // Redirect to delete route
            }
        });
    });


    const menubar = document.querySelector('.menubar');
    const sidebar = document.querySelector('.sidebar').style;
    const mainBody = document.querySelector('.mainBody').style;

    menubar.addEventListener('click', () => {
        console.log("MENUBARs");
        console.log(sidebar.display);

        if (sidebar.display == '') {
            sidebar.display = 'block';
            mainBody.display = 'none';
        }
        else if (sidebar.display == 'block') {
            sidebar.display = '';
            mainBody.display = 'block';
        }
    })
});

