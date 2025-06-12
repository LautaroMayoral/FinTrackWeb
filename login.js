const loginForm = document.getElementById('login-form');

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      window.location.href = "app.html"; // Cambia por el nombre de tu archivo principal
    } catch (error) {
      alert('Error al iniciar sesión: ' + error.message);
    }
  });
}