// Incluye estos scripts en tu HTML antes de tus scripts propios:
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>

const firebaseConfig = {
  apiKey: "AIzaSyCJfwe2gJqIzHQCL14JJpaUUS6HSn6F3Go",
  authDomain: "basefintrack.firebaseapp.com",
  projectId: "basefintrack",
  storageBucket: "basefintrack.appspot.com",
  messagingSenderId: "217518055647",
  appId: "1:217518055647:web:527b2566e80d605a8e496a"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();