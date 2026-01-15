// Configuración de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// TU CONFIGURACIÓN DE FIREBASE (obtenerla de Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAt1jcVjKalPNgTwLow04DyWhMSl0x-ngI",
  authDomain: "funsama-web.firebaseapp.com",
  projectId: "funsama-web",
  storageBucket: "funsama-web.firebasestorage.app",
  messagingSenderId: "844003687968",
  appId: "1:844003687968:web:f9f6607262e0f55abec645",
  measurementId: "G-BQFJLHQYKZ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Elementos del DOM
const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const proyectoForm = document.getElementById('proyectoForm');
const proyectosContainer = document.getElementById('proyectosContainer');

/**
 * Verifica si un usuario es administrador consultando la colección 'admins' en Firestore.
 * @param {object} user - El objeto de usuario de Firebase Auth.
 * @returns {boolean} - True si el usuario es admin, false en caso contrario.
 */
async function esUsuarioAdmin(user) {
    if (!user) return false;
    
    try {
        const adminsRef = collection(db, 'admins');
        const q = query(adminsRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        return !querySnapshot.empty; // Si no está vacío, el usuario es admin
    } catch (error) {
        console.error("Error al verificar permisos de administrador:", error);
        return false;
    }
}

// Login con Google
googleLoginBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        console.log('Usuario autenticado:', result.user);
    } catch (error) {
        alert('Error al iniciar sesión: ' + error.message);
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        alert('Sesión cerrada correctamente');
    } catch (error) {
        alert('Error al cerrar sesión: ' + error.message);
    }
});

// Detectar cambios en autenticación
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const esAdmin = await esUsuarioAdmin(user);
        
        if (esAdmin) {
            // Usuario es administrador, mostrar panel
            loginScreen.style.display = 'none';
            adminPanel.style.display = 'block';
            document.getElementById('userName').textContent = user.displayName;
            document.getElementById('userPhoto').src = user.photoURL;
            cargarProyectos();
        } else {
            // Usuario no es administrador, denegar acceso
            alert('Acceso denegado. No tienes permisos para acceder a esta página.');
            await signOut(auth);
        }
    } else {
        // Usuario no logueado
        loginScreen.style.display = 'flex';
        adminPanel.style.display = 'none';
    }
});

// Agregar nuevo proyecto
proyectoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const proyecto = {
        titulo: document.getElementById('titulo').value,
        estado: document.getElementById('estado').value,
        fecha: document.getElementById('fecha').value,
        descripcion: document.getElementById('descripcion').value,
        objetivos: document.getElementById('objetivos').value,
        impacto: document.getElementById('impacto').value,
        imagenUrl: document.getElementById('imagenUrl').value,
        fechaCreacion: new Date()
    };
    
    try {
        await addDoc(collection(db, 'proyectos'), proyecto);
        alert('¡Proyecto publicado correctamente!');
        proyectoForm.reset();
        cargarProyectos();
    } catch (error) {
        alert('Error al publicar: ' + error.message);
    }
});

// Cargar proyectos
async function cargarProyectos() {
    const q = query(collection(db, 'proyectos'), orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    
    proyectosContainer.innerHTML = '';
    
    querySnapshot.forEach((doc) => {
        const p = doc.data();
        proyectosContainer.innerHTML += `
            <div class="proyecto-item">
                <img src="${p.imagenUrl}" alt="${p.titulo}">
                <div class="proyecto-info">
                    <h3>${p.titulo}</h3>
                    <p class="fecha">${p.estado} - ${p.fecha}</p>
                    <p>${p.descripcion.substring(0, 150)}...</p>
                </div>
                <button class="btn-delete" onclick="eliminarProyecto('${doc.id}')">Eliminar</button>
            </div>
        `;
    });
}

// Eliminar proyecto
window.eliminarProyecto = async (id) => {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
        try {
            await deleteDoc(doc(db, 'proyectos', id));
            alert('Proyecto eliminado');
            cargarProyectos();
        } catch (error) {
            alert('Error al eliminar: ' + error.message);
        }
    }
};
