// ============================================
// CONFIGURACIÓN DE FIREBASE
// ============================================
// Reemplaza con tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAt1jcVjKalPNgTwLow04DyWhMSl0x-ngI",
  authDomain: "funsama-web.firebaseapp.com",
  projectId: "funsama-web",
  storageBucket: "funsama-web.firebasestorage.app",
  messagingSenderId: "844003687968",
  appId: "1:844003687968:web:f9f6607262e0f55abec645",
  measurementId: "G-BQFJLHQYKZ"
};

// Importar Firebase (CDN)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ============================================
// VARIABLES GLOBALES
// ============================================
let editingProjectId = null;
let projectToDelete = null;

// ============================================
// ELEMENTOS DOM
// ============================================
const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const userPhoto = document.getElementById('userPhoto');
const proyectoForm = document.getElementById('proyectoForm');
const proyectosContainer = document.getElementById('proyectosContainer');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const filterEstado = document.getElementById('filterEstado');
const confirmModal = document.getElementById('confirmModal');
const closeModal = document.getElementById('closeModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagenUrlInput = document.getElementById('imagenUrl');

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================
googleLoginBtn.addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, provider);
        showToast('Inicio de sesión exitoso', 'success');
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        showToast('Error al iniciar sesión', 'error');
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        showToast('Sesión cerrada correctamente', 'success');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        showToast('Error al cerrar sesión', 'error');
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginScreen.style.display = 'none';
        adminPanel.style.display = 'block';
        userName.textContent = user.displayName;
        userPhoto.src = user.photoURL;
        cargarProyectos();
    } else {
        loginScreen.style.display = 'flex';
        adminPanel.style.display = 'none';
    }
});

// ============================================
// CAPITALIZACIÓN AUTOMÁTICA
// ============================================
function setupCapitalization() {
    const capitalizeInputs = document.querySelectorAll('.capitalize-input');
    
    capitalizeInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            const start = this.selectionStart;
            const end = this.selectionEnd;
            
            // Solo capitalizar si es el primer carácter o después de punto seguido
            if (this.value.length === 1) {
                this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1);
            } else if (this.value.length > 1) {
                // Capitalizar después de ". "
                this.value = this.value.replace(/\.\s+([a-z])/g, (match) => {
                    return match.toUpperCase();
                });
                
                // Capitalizar después de salto de línea
                this.value = this.value.replace(/\n([a-z])/g, (match) => {
                    return match.toUpperCase();
                });
            }
            
            this.setSelectionRange(start, end);
        });
        
        // Capitalizar el primer carácter al hacer focus si está vacío
        input.addEventListener('focus', function() {
            if (this.value.length === 0) {
                this.addEventListener('keypress', function capitalizeFirst(e) {
                    if (e.key.length === 1 && /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(e.key)) {
                        const start = this.selectionStart;
                        const end = this.selectionEnd;
                        this.value = this.value.substring(0, start) + 
                                    e.key.toUpperCase() + 
                                    this.value.substring(end);
                        this.setSelectionRange(start + 1, start + 1);
                        e.preventDefault();
                        this.removeEventListener('keypress', capitalizeFirst);
                    }
                });
            }
        });
    });
}

// Inicializar capitalización
setupCapitalization();

// ============================================
// VISTA PREVIA DE IMAGEN
// ============================================
imagenUrlInput.addEventListener('input', function() {
    const url = this.value.trim();
    
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        imagePreview.src = url;
        imagePreviewContainer.style.display = 'block';
        
        imagePreview.onerror = function() {
            imagePreviewContainer.style.display = 'none';
            showToast('URL de imagen inválida', 'warning');
        };
    } else {
        imagePreviewContainer.style.display = 'none';
    }
});

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 'fa-exclamation-triangle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// AGREGAR/EDITAR PROYECTO
// ============================================
proyectoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const proyecto = {
        titulo: document.getElementById('titulo').value.trim(),
        estado: document.getElementById('estado').value,
        fecha: document.getElementById('fecha').value.trim(),
        descripcion: document.getElementById('descripcion').value.trim(),
        objetivos: document.getElementById('objetivos').value.trim(),
        impacto: document.getElementById('impacto').value.trim(),
        imagenUrl: document.getElementById('imagenUrl').value.trim(),
        fechaCreacion: editingProjectId ? undefined : new Date().toISOString()
    };
    
    try {
        if (editingProjectId) {
            // Actualizar proyecto existente
            await updateDoc(doc(db, 'proyectos', editingProjectId), proyecto);
            showToast('Proyecto actualizado correctamente', 'success');
        } else {
            // Agregar nuevo proyecto
            await addDoc(collection(db, 'proyectos'), proyecto);
            showToast('Proyecto publicado correctamente', 'success');
        }
        
        resetForm();
        cargarProyectos();
    } catch (error) {
        console.error('Error al guardar proyecto:', error);
        showToast('Error al guardar el proyecto', 'error');
    }
});

// ============================================
// CARGAR PROYECTOS
// ============================================
async function cargarProyectos(filtroEstado = '') {
    try {
        const q = query(collection(db, 'proyectos'), orderBy('fechaCreacion', 'desc'));
        const querySnapshot = await getDocs(q);
        
        proyectosContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            proyectosContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No hay proyectos publicados aún</p>
                </div>
            `;
            return;
        }
        
        querySnapshot.forEach((docSnap) => {
            const proyecto = docSnap.data();
            const id = docSnap.id;
            
            // Aplicar filtro de estado
            if (filtroEstado && proyecto.estado !== filtroEstado) {
                return;
            }
            
            const card = crearProyectoCard(proyecto, id);
            proyectosContainer.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error al cargar proyectos:', error);
        showToast('Error al cargar los proyectos', 'error');
    }
}

// ============================================
// CREAR TARJETA DE PROYECTO
// ============================================
function crearProyectoCard(proyecto, id) {
    const card = document.createElement('div');
    card.className = 'proyecto-card';
    
    const estadoClass = proyecto.estado.toLowerCase().replace(/ /g, '-');
    
    card.innerHTML = `
        <img src="${proyecto.imagenUrl}" alt="${proyecto.titulo}" class="proyecto-imagen" 
             onerror="this.src='images/placeholder.jpg'">
        <div class="proyecto-content">
            <div class="proyecto-header">
                <h3 class="proyecto-title">${proyecto.titulo}</h3>
                <span class="badge ${estadoClass}">${proyecto.estado}</span>
            </div>
            <p class="proyecto-fecha">
                <i class="far fa-calendar-alt"></i> ${proyecto.fecha}
            </p>
            <p class="proyecto-descripcion">${proyecto.descripcion}</p>
            ${proyecto.objetivos ? `
                <div class="proyecto-objetivos">
                    <strong>Objetivos:</strong>
                    <p style="font-size: 0.9rem; color: var(--text-light); margin-top: 5px;">
                        ${proyecto.objetivos.split('\n').slice(0, 2).join(' • ')}
                        ${proyecto.objetivos.split('\n').length > 2 ? '...' : ''}
                    </p>
                </div>
            ` : ''}
            <div class="proyecto-actions">
                <button class="btn-edit" onclick="editarProyecto('${id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="confirmarEliminar('${id}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// ============================================
// EDITAR PROYECTO
// ============================================
window.editarProyecto = async (id) => {
    try {
        const docRef = doc(db, 'proyectos', id);
        const docSnap = await getDocs(query(collection(db, 'proyectos')));
        
        let proyecto = null;
        docSnap.forEach((doc) => {
            if (doc.id === id) {
                proyecto = doc.data();
            }
        });
        
        if (!proyecto) {
            showToast('Proyecto no encontrado', 'error');
            return;
        }
        
        // Cambiar el título del formulario
        formTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Proyecto';
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Proyecto';
        cancelBtn.style.display = 'block';
        
        // Rellenar el formulario
        document.getElementById('proyectoId').value = id;
        document.getElementById('titulo').value = proyecto.titulo;
        document.getElementById('estado').value = proyecto.estado;
        document.getElementById('fecha').value = proyecto.fecha;
        document.getElementById('descripcion').value = proyecto.descripcion;
        document.getElementById('objetivos').value = proyecto.objetivos || '';
        document.getElementById('impacto').value = proyecto.impacto || '';
        document.getElementById('imagenUrl').value = proyecto.imagenUrl;
        
        // Mostrar vista previa de imagen
        imagePreview.src = proyecto.imagenUrl;
        imagePreviewContainer.style.display = 'block';
        
        editingProjectId = id;
        
        // Scroll al formulario
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error al editar proyecto:', error);
        showToast('Error al cargar el proyecto para editar', 'error');
    }
};

// ============================================
// CANCELAR EDICIÓN
// ============================================
cancelBtn.addEventListener('click', () => {
    resetForm();
});

function resetForm() {
    proyectoForm.reset();
    formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Nuevo Proyecto';
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Publicar Proyecto';
    cancelBtn.style.display = 'none';
    imagePreviewContainer.style.display = 'none';
    editingProjectId = null;
    document.getElementById('proyectoId').value = '';
}

// ============================================
// ELIMINAR PROYECTO
// ============================================
window.confirmarEliminar = (id) => {
    projectToDelete = id;
    confirmModal.classList.add('active');
};

closeModal.addEventListener('click', () => {
    confirmModal.classList.remove('active');
    projectToDelete = null;
});

cancelDelete.addEventListener('click', () => {
    confirmModal.classList.remove('active');
    projectToDelete = null;
});

confirmDelete.addEventListener('click', async () => {
    if (!projectToDelete) return;
    
    try {
        await deleteDoc(doc(db, 'proyectos', projectToDelete));
        showToast('Proyecto eliminado correctamente', 'success');
        cargarProyectos(filterEstado.value);
        confirmModal.classList.remove('active');
        projectToDelete = null;
    } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        showToast('Error al eliminar el proyecto', 'error');
    }
});

// Cerrar modal al hacer clic fuera
confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        confirmModal.classList.remove('active');
        projectToDelete = null;
    }
});

// ============================================
// FILTRO DE ESTADO
// ============================================
filterEstado.addEventListener('change', (e) => {
    cargarProyectos(e.target.value);
});

// ============================================
// VALIDACIÓN DE FORMULARIO
// ============================================
function validarURL(url) {
    try {
        new URL(url);
        return url.startsWith('http://') || url.startsWith('https://');
    } catch {
        return false;
    }
}

proyectoForm.addEventListener('submit', (e) => {
    const imagenUrl = document.getElementById('imagenUrl').value;
    
    if (!validarURL(imagenUrl)) {
        e.preventDefault();
        showToast('Por favor ingrese una URL válida para la imagen', 'warning');
        return false;
    }
});