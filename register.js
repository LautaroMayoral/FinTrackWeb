const registerForm = document.getElementById('register-form');

if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('newEmail').value;
    const password = document.getElementById('newPassword').value;

    if (!email || !password) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    try {
      // Registrar usuario en Firebase Auth
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      window.location.href = 'index.html'; // Redirige al login
    } catch (error) {
      alert('Error al registrar: ' + error.message);
    }
  });
}