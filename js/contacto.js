// Funcionalidad del formulario de contacto

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const modal = document.getElementById('successModal');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});

// Manejar envío del formulario
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Obtener los valores del formulario
    const formData = {
        nombre: document.getElementById('nombre').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        asunto: document.getElementById('asunto').value.trim(),
        mensaje: document.getElementById('mensaje').value.trim()
    };
    
    // Validar el formulario
    if (!validateContactForm(formData)) {
        return false;
    }
    
    // Simular envío (aquí irá tu lógica de envío real)
    // Por ejemplo: enviar a un servidor, a un servicio como FormSpree, etc.
    
    // Mostrar indicador de carga
    const submitBtn = event.target.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    // Simular delay de envío (reemplaza esto con tu lógica real)
    setTimeout(() => {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Limpiar formulario
        event.target.reset();
        
        // Mostrar modal de confirmación
        showSuccessModal();
        
        // Aquí puedes agregar el código para enviar realmente el formulario
        // Por ejemplo:
        // sendFormToServer(formData);
        
        console.log('Datos del formulario:', formData);
    }, 1500);
    
    return false;
}

// Validar formulario
function validateContactForm(data) {
    // Validar nombre
    if (data.nombre === '') {
        showError('Por favor, ingresa tu nombre completo');
        document.getElementById('nombre').focus();
        return false;
    }
    
    if (data.nombre.length < 3) {
        showError('El nombre debe tener al menos 3 caracteres');
        document.getElementById('nombre').focus();
        return false;
    }
    
    // Validar email
    if (data.email === '') {
        showError('Por favor, ingresa tu correo electrónico');
        document.getElementById('email').focus();
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showError('Por favor, ingresa un correo electrónico válido');
        document.getElementById('email').focus();
        return false;
    }
    
    // Validar asunto
    if (data.asunto === '') {
        showError('Por favor, ingresa el asunto de tu mensaje');
        document.getElementById('asunto').focus();
        return false;
    }
    
    // Validar mensaje
    if (data.mensaje === '') {
        showError('Por favor, escribe tu mensaje');
        document.getElementById('mensaje').focus();
        return false;
    }
    
    if (data.mensaje.length < 10) {
        showError('El mensaje debe tener al menos 10 caracteres');
        document.getElementById('mensaje').focus();
        return false;
    }
    
    return true;
}

// Mostrar error
function showError(message) {
    // Crear elemento de alerta si no existe
    let errorDiv = document.querySelector('.form-error');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        const form = document.getElementById('contactForm');
        form.insertBefore(errorDiv, form.firstChild);
    }
    
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    errorDiv.style.display = 'flex';
    errorDiv.style.alignItems = 'center';
    errorDiv.style.gap = '10px';
    errorDiv.style.padding = '12px 15px';
    errorDiv.style.marginBottom = '20px';
    errorDiv.style.backgroundColor = '#fee';
    errorDiv.style.color = '#c33';
    errorDiv.style.borderRadius = '8px';
    errorDiv.style.border = '1px solid #fcc';
    errorDiv.style.animation = 'shake 0.5s';
    
    // Agregar animación de shake
    if (!document.querySelector('style[data-error-animation]')) {
        const style = document.createElement('style');
        style.setAttribute('data-error-animation', 'true');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Eliminar después de 5 segundos
    setTimeout(() => {
        errorDiv.style.animation = 'fadeOut 0.5s';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 500);
    }, 5000);
}

// Mostrar modal de éxito
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('active');
        
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
        
        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// Cerrar modal
function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('active');
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
    }
}

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Función para enviar realmente el formulario (ejemplo con FormSpree)
// Descomenta y adapta según necesites
/*
async function sendFormToServer(data) {
    try {
        const response = await fetch('https://formspree.io/f/TU_FORM_ID', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showSuccessModal();
            document.getElementById('contactForm').reset();
        } else {
            showError('Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión. Por favor, verifica tu internet e intenta nuevamente.');
    }
}
*/

// Validación en tiempo real (opcional)
function addRealTimeValidation() {
    const inputs = document.querySelectorAll('#contactForm input, #contactForm textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && this.value.trim() === '') {
                this.style.borderColor = '#f44336';
            } else {
                this.style.borderColor = '#e0e0e0';
            }
        });
        
        input.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(244, 67, 54)') {
                this.style.borderColor = '#e0e0e0';
            }
        });
    });
}

// Llamar a la validación en tiempo real
addRealTimeValidation();

// Auto-resize del textarea
const textarea = document.getElementById('mensaje');
if (textarea) {
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

// Contador de caracteres para el mensaje (opcional)
function addCharacterCounter() {
    const mensaje = document.getElementById('mensaje');
    const formGroup = mensaje.parentElement;
    
    const counter = document.createElement('div');
    counter.className = 'character-counter';
    counter.style.textAlign = 'right';
    counter.style.fontSize = '0.85rem';
    counter.style.color = '#999';
    counter.style.marginTop = '5px';
    
    formGroup.appendChild(counter);
    
    mensaje.addEventListener('input', function() {
        const length = this.value.length;
        counter.textContent = `${length} caracteres`;
        
        if (length < 10) {
            counter.style.color = '#f44336';
        } else {
            counter.style.color = '#4CAF50';
        }
    });
}

// Activar contador de caracteres
addCharacterCounter();