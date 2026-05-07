const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const usuario = document.getElementById('userEmail').value;
    const pass = document.getElementById('userPass').value;

    const ADMIN_USER = "admin";
    const ADMIN_PASS = "1234";

    if (usuario === ADMIN_USER && pass === ADMIN_PASS) {
        Swal.fire({
            icon: 'success',
            title: 'Acceso Concedido',
            text: 'Bienvenido al panel de control, Usuario.',
            background: '#1E1E1E',
            color: '#979292',
            confirmButtonColor: '#FF6B00',
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            }
        }).then(() => {
            window.location.href = './pages/dashboard.html';
        });

    } else {

        Swal.fire({
            icon: 'error',
            title: 'Error de Autenticación',
            text: 'Usuario o contraseña incorrectos. Intenta con admin/1234.',
            background: '#1E1E1E',
            color: '#979292',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Reintentar'
        });
        
        document.getElementById('userPass').value = "";
    }
});