firebase.auth().onAuthStateChanged(user => {
  if (user) {
    cargarDashboard();
    cargarIngresos();
    cargarGastos();
    // ...otras funciones que dependan del usuario...
  } else {
    window.location.href = "index.html";
  }
});

// Seleccionar elementos del DOM
const formIngreso = document.getElementById('form-ingreso');
const listaIngresos = document.getElementById('ingresos-lista');
const formGasto = document.getElementById('form-gasto');
const listaGastos = document.getElementById('egresos-lista');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroMes = document.getElementById('filtro-mes');
const filtroAnio = document.getElementById('filtro-anio');
const listaMovimientos = document.getElementById('movimientos-lista');
const botonesNavegacion = document.querySelectorAll('.boton');
const secciones = document.querySelectorAll('.seccion');

// Listeners para filtros de movimientos
if (filtroTipo && filtroMes && filtroAnio) {
  filtroTipo.addEventListener('change', cargarMovimientos);
  filtroMes.addEventListener('change', cargarMovimientos);
  filtroAnio.addEventListener('change', cargarMovimientos);
}

// Función para alternar entre secciones
botonesNavegacion.forEach(boton => {
  boton.addEventListener('click', () => {
    const sectionId = boton.getAttribute('data-section');
    secciones.forEach(seccion => {
      seccion.classList.add('oculto');
      seccion.classList.remove('activa');
    });
    const selectedSection = document.getElementById(sectionId);
    selectedSection.classList.remove('oculto');
    selectedSection.classList.add('activa');
    if (sectionId === 'movimientos') cargarMovimientos();
    if (sectionId === 'ingresos') escucharIngresos();
    if (sectionId === 'egresos') cargarGastos();
    if (sectionId === 'dashboard') cargarDashboard();
    if (sectionId === 'informes') cargarInforme();
  });
});

// Ingresos
if (formIngreso) {
  formIngreso.addEventListener('submit', async (event) => {
    event.preventDefault();
    const descripcion = document.getElementById('descripcion').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const categoria = document.getElementById('categoria').value;
    const fecha = document.getElementById('fecha').value;
    if (!descripcion || isNaN(monto) || !categoria || !fecha) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    const user = firebase.auth().currentUser;
    if (!user) {
      alert('Debes iniciar sesión.');
      return;
    }
    const nuevoIngreso = { descripcion, monto, categoria, fecha, uid: user.uid };
    try {
      await db.collection('ingresos').add(nuevoIngreso);
      alert('Ingreso guardado correctamente.');
      formIngreso.reset();
     
    } catch (error) {
      alert('Error al guardar el ingreso: ' + error.message);
    }
  });
}

function escucharIngresos() {
  if (!listaIngresos) return;
  const user = firebase.auth().currentUser;
  if (!user) return;
  // Limpia la lista antes de escuchar
  listaIngresos.innerHTML = '';
  db.collection('ingresos')
    .where('uid', '==', user.uid)
    .orderBy('fecha', 'desc')
    .onSnapshot(snapshot => {
      listaIngresos.innerHTML = '';
      snapshot.forEach(doc => {
        const ingreso = doc.data();
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.style.padding = '8px 0';
        const texto = document.createElement('span');
        texto.textContent = `${ingreso.fecha} - ${ingreso.descripcion} - $${ingreso.monto} (${ingreso.categoria})`;
        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.className = 'btn-eliminar';
        btnEliminar.onclick = async () => {
          if (confirm('¿Seguro que deseas eliminar este ingreso?')) {
            await db.collection('ingresos').doc(doc.id).delete();
          }
        };
        li.appendChild(texto);
        li.appendChild(btnEliminar);
        listaIngresos.appendChild(li);
      });
    });
}

async function cargarIngresos() {
  if (!listaIngresos) return;
  listaIngresos.innerHTML = '';
  const user = firebase.auth().currentUser;
  if (!user) return;
  try {
    const snapshot = await db.collection('ingresos')
      .where('uid', '==', user.uid)
      .orderBy('fecha', 'desc')
      .get();


    snapshot.forEach(doc => {
       console.log("Ingreso:", doc.data());
      const ingreso = doc.data();
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';
      li.style.padding = '8px 0';
      const texto = document.createElement('span');
      texto.textContent = `${ingreso.fecha} - ${ingreso.descripcion} - $${ingreso.monto} (${ingreso.categoria})`;
      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = 'Eliminar';
      btnEliminar.className = 'btn-eliminar';
      btnEliminar.onclick = async () => {
        if (confirm('¿Seguro que deseas eliminar este ingreso?')) {
          await db.collection('ingresos').doc(doc.id).delete();
          cargarIngresos();
        }
      };
      li.appendChild(texto);
      li.appendChild(btnEliminar);
      listaIngresos.appendChild(li);
    });
  } catch (error) {
    listaIngresos.innerHTML = '<li>Error al cargar ingresos.</li>';
  }
}

async function eliminarTodosLosIngresos() {
  if (!confirm('¿Seguro que deseas eliminar TODOS los ingresos? Esta acción no se puede deshacer.')) return;
  const user = firebase.auth().currentUser;
  if (!user) return;
  try {
    const snapshot = await db.collection('ingresos').where('uid', '==', user.uid).get();
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    cargarIngresos();
    alert('Todos los ingresos han sido eliminados.');
  } catch (error) {
    alert('Error al eliminar todos los ingresos: ' + error.message);
  }
}

// Gastos
if (formGasto) {
  formGasto.addEventListener('submit', async (event) => {
    event.preventDefault();
    const descripcion = document.getElementById('descGasto').value;
    const monto = parseFloat(document.getElementById('montoGasto').value);
    const categoria = document.getElementById('catGasto').value;
    const fecha = document.getElementById('fechaGasto').value;
    if (!descripcion || isNaN(monto) || !categoria || !fecha) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    const user = firebase.auth().currentUser;
    if (!user) {
      alert('Debes iniciar sesión.');
      return;
    }
    const nuevoGasto = { descripcion, monto, categoria, fecha, uid: user.uid };
    try {
      await db.collection('gastos').add(nuevoGasto);
      alert('Gasto guardado correctamente.');
      formGasto.reset();
      cargarGastos(); // Recargar lista de gastos
      
    } catch (error) {
      alert('Error al guardar el gasto: ' + error.message);
    }
  });
}

async function cargarGastos() {
  if (!listaGastos) return;
  listaGastos.innerHTML = '';
  const user = firebase.auth().currentUser;
  if (!user) return;
  try {
    const snapshot = await db.collection('gastos')
      .where('uid', '==', user.uid)
      .orderBy('fecha', 'desc')
      .get();
    snapshot.forEach(doc => {
      const gasto = doc.data();
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';
      li.style.padding = '8px 0';
      const texto = document.createElement('span');
      texto.textContent = `${gasto.fecha} - ${gasto.descripcion} - $${gasto.monto} (${gasto.categoria})`;
      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = 'Eliminar';
      btnEliminar.className = 'btn-eliminar';
      btnEliminar.onclick = async () => {
        if (confirm('¿Seguro que deseas eliminar este gasto?')) {
          await db.collection('gastos').doc(doc.id).delete();
          cargarGastos();
        }
      };
      li.appendChild(texto);
      li.appendChild(btnEliminar);
      listaGastos.appendChild(li);
    });
  } catch (error) {
    listaGastos.innerHTML = '<li>Error al cargar gastos.</li>';
  }
}

async function eliminarTodosLosGastos() {
  if (!confirm('¿Seguro que deseas eliminar TODOS los gastos? Esta acción no se puede deshacer.')) return;
  const user = firebase.auth().currentUser;
  if (!user) return;
  try {
    const snapshot = await db.collection('gastos').where('uid', '==', user.uid).get();
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    cargarGastos();
    alert('Todos los gastos han sido eliminados.');
  } catch (error) {
    alert('Error al eliminar todos los gastos: ' + error.message);
  }
}

// Llenar años automáticamente (opcional)
(function llenarAnios() {
  if (!filtroAnio) return;
  const anioActual = new Date().getFullYear();
  for (let a = anioActual; a >= anioActual - 10; a--) {
    const option = document.createElement('option');
    option.value = a;
    option.textContent = a;
    filtroAnio.appendChild(option);
  }
})();

// Función para cargar movimientos filtrados (debes completarla si no la tienes)
async function cargarMovimientos() {
  if (!listaMovimientos) return;
  // ...tu lógica de filtrado y renderizado...
}

async function cargarDashboard() {
  const totalIngresosElem = document.getElementById('total-ingresos');
  const totalGastosElem = document.getElementById('total-gastos');
  const balanceActualElem = document.getElementById('balance-actual');
  const ctxIngresosGastos = document.getElementById('graficoIngresosGastos')?.getContext('2d');
  const ctxCategorias = document.getElementById('graficoCategorias')?.getContext('2d');
  if (!totalIngresosElem || !totalGastosElem || !balanceActualElem || !ctxIngresosGastos || !ctxCategorias) return;
  const hoy = new Date();
  const mesActual = String(hoy.getMonth() + 1).padStart(2, '0');
  const anioActual = String(hoy.getFullYear());
  let movimientos = [];
  const user = firebase.auth().currentUser;
  if (!user) return;
  // Traer ingresos y gastos SOLO del usuario actual
  const ingresosSnap = await db.collection('ingresos').where('uid', '==', user.uid).get();
  ingresosSnap.forEach(doc => movimientos.push({ ...doc.data(), tipo: 'Ingreso' }));
  const gastosSnap = await db.collection('gastos').where('uid', '==', user.uid).get();
  gastosSnap.forEach(doc => movimientos.push({ ...doc.data(), tipo: 'Gasto' }));
  // Filtrar por mes y año actual
  movimientos = movimientos.filter(mov => {
    if (!mov.fecha) return false;
    const [anio, mes] = mov.fecha.split('-');
    return anio === anioActual && mes === mesActual;
  });
  // Calcular totales
  const totalIngresos = movimientos.filter(m => m.tipo === 'Ingreso').reduce((sum, m) => sum + Number(m.monto), 0);
  const totalGastos = movimientos.filter(m => m.tipo === 'Gasto').reduce((sum, m) => sum + Number(m.monto), 0);
  const balance = totalIngresos - totalGastos;
  // Mostrar totales
  totalIngresosElem.textContent = `$${totalIngresos.toFixed(2)}`;
  totalGastosElem.textContent = `$${totalGastos.toFixed(2)}`;
  balanceActualElem.textContent = `$${balance.toFixed(2)}`;
  // Gráfico Ingresos vs Gastos
  if (window.graficoIngresosGastos instanceof Chart) {
    window.graficoIngresosGastos.destroy();
  }
  window.graficoIngresosGastos = new Chart(ctxIngresosGastos, {
    type: 'bar',
    data: {
      labels: ['Ingresos', 'Gastos'],
      datasets: [{
        label: 'Monto',
        data: [totalIngresos, totalGastos],
        backgroundColor: ['#38a169', '#e53e3e']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
  // Gráfico de Categorías
  const categorias = {};
  movimientos.forEach(mov => {
    if (!categorias[mov.categoria]) categorias[mov.categoria] = 0;
    categorias[mov.categoria] += Number(mov.monto);
  });
  if (window.graficoCategorias instanceof Chart) {
    window.graficoCategorias.destroy();
  }
  window.graficoCategorias = new Chart(ctxCategorias, {
    type: 'pie',
    data: {
      labels: Object.keys(categorias),
      datasets: [{
        data: Object.values(categorias),
        backgroundColor: [
          '#4299e1', '#ed8936', '#48bb78', '#f56565', '#9f7aea', '#ecc94b', '#38b2ac', '#a0aec0'
        ]
      }]
    },
    options: { responsive: true }
  });
}

// Llama a cargarDashboard() al mostrar el dashboard
botonesNavegacion.forEach(boton => {
  boton.addEventListener('click', () => {
    const sectionId = boton.getAttribute('data-section');
    if (sectionId === 'dashboard') {
      cargarDashboard();
    }
  });
});

// Si el dashboard es la sección activa al cargar, llama una vez:
if (document.getElementById('dashboard')?.classList.contains('activa')) {
  cargarDashboard();
}

// Selección de elementos de informes
const formInformes = document.getElementById('form-informes');
const filtroMesInforme = document.getElementById('filtro-mes-informe');
const filtroAnioInforme = document.getElementById('filtro-anio-informe');
const listaInformes = document.getElementById('lista-informes');
const resultadosInforme = document.getElementById('resultados-informe');

// Función para cargar el informe
async function cargarInforme(event) {
  if (event) event.preventDefault();
  listaInformes.innerHTML = '<li>Cargando...</li>';
  let movimientos = [];
  const user = firebase.auth().currentUser;
  if (!user) return;
  // Traer ingresos
  const ingresosSnap = await db.collection('ingresos').where('uid', '==', user.uid).get();
  ingresosSnap.forEach(doc => {
    movimientos.push({ ...doc.data(), tipo: 'Ingreso' });
  });
  // Traer gastos
  const gastosSnap = await db.collection('gastos').where('uid', '==', user.uid).get();
  gastosSnap.forEach(doc => {
    movimientos.push({ ...doc.data(), tipo: 'Gasto' });
  });
  // Filtrar por mes y año
  movimientos = movimientos.filter(mov => {
    if (!mov.fecha) return false;
    const [anio, mes] = mov.fecha.split('-');
    const coincideMes = filtroMesInforme.value === 'todos' || mes === filtroMesInforme.value.padStart(2, '0');
    const coincideAnio = !filtroAnioInforme.value || filtroAnioInforme.value === 'todos' || anio === filtroAnioInforme.value;
    return coincideMes && coincideAnio;
  });
  // Calcular totales
  const totalIngresos = movimientos.filter(m => m.tipo === 'Ingreso').reduce((sum, m) => sum + Number(m.monto), 0);
  const totalGastos = movimientos.filter(m => m.tipo === 'Gasto').reduce((sum, m) => sum + Number(m.monto), 0);
  const balance = totalIngresos - totalGastos;
  // Mostrar resumen arriba de la lista
  resultadosInforme.innerHTML = `
    <h3 class="text-lg font-bold mb-4">📋 Resultados del Informe</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-green-100 border-l-4 border-green-500 p-4 rounded shadow">
        <h4 class="font-bold text-green-700 mb-1">Total Ingresos</h4>
        <p class="text-2xl font-bold text-green-800">$${totalIngresos.toFixed(2)}</p>
      </div>
      <div class="bg-red-100 border-l-4 border-red-500 p-4 rounded shadow">
        <h4 class="font-bold text-red-700 mb-1">Total Gastos</h4>
        <p class="text-2xl font-bold text-red-800">$${totalGastos.toFixed(2)}</p>
      </div>
      <div class="bg-blue-100 border-l-4 border-blue-500 p-4 rounded shadow">
        <h4 class="font-bold text-blue-700 mb-1">Balance</h4>
        <p class="text-2xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}">$${balance.toFixed(2)}</p>
      </div>
    </div>
    <ul id="lista-informes" class="divide-y divide-gray-200"></ul>
  `;
  // Mostrar lista de movimientos
  const lista = resultadosInforme.querySelector('#lista-informes');
  lista.innerHTML = '';
  if (movimientos.length === 0) {
    lista.innerHTML = '<li class="text-gray-500">No hay movimientos para este filtro.</li>';
    return;
  }
  movimientos.sort((a, b) => b.fecha.localeCompare(a.fecha));
  movimientos.forEach(mov => {
    const li = document.createElement('li');
    li.className = 'py-2 flex items-center justify-between';
    li.innerHTML = `
      <span>
        <span class="inline-block px-2 py-1 rounded text-xs font-semibold ${mov.tipo === 'Ingreso' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'} mr-2">
          ${mov.tipo}
        </span>
        <span class="font-medium">${mov.descripcion}</span>
        <span class="text-gray-500">(${mov.categoria})</span>
      </span>
      <span class="font-mono">${mov.fecha}</span>
      <span class="font-bold ${mov.tipo === 'Ingreso' ? 'text-green-700' : 'text-red-700'}">$${mov.monto}</span>
    `;
    lista.appendChild(li);
  });
}

// Evento para el formulario de informes
if (formInformes) {
  formInformes.addEventListener('submit', cargarInforme);
}

// Cargar informe automáticamente al mostrar la sección
botonesNavegacion.forEach(boton => {
  boton.addEventListener('click', () => {
    const sectionId = boton.getAttribute('data-section');
    if (sectionId === 'informes') {
      cargarInforme();
    }
  });
});

const btnCerrarSesion = document.getElementById('logoutButton');
if (btnCerrarSesion) {
  btnCerrarSesion.addEventListener('click', async () => {
    try {
      await firebase.auth().signOut();
      window.location.href = "index.html";
    } catch (error) {
      alert('Error al cerrar sesión: ' + error.message);
    }
  });
}
const btnDarkMode = document.getElementById('toggleTheme');
if (btnDarkMode) {
  btnDarkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    // Opcional: guarda preferencia en localStorage
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('modoOscuro', '1');
      btnDarkMode.textContent = '☀️ Modo Claro';
    } else {
      localStorage.setItem('modoOscuro', '0');
      btnDarkMode.textContent = '🌙 Modo Oscuro';
    }
  });

  // Al cargar, aplica el modo guardado
  if (localStorage.getItem('modoOscuro') === '1') {
    document.body.classList.add('dark-mode');
    btnDarkMode.textContent = '☀️ Modo Claro';
  }
}