/**
 * SIRH - Script Principal (js/main.js)
 * Control del Modal de Autenticación integrado en sirh.html
 */

document.addEventListener('DOMContentLoaded', () => {
    // Referencias principales del Modal
    const modalOverlay = document.getElementById('auth-modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Pestañas
    const tabLogin = document.getElementById('modal-tab-login');
    const tabRegister = document.getElementById('modal-tab-register');
    const viewLogin = document.getElementById('modal-view-login');
    const viewRegister = document.getElementById('modal-view-register');
    const switchToRegister = document.getElementById('modal-switch-to-register');
    const switchToLogin = document.getElementById('modal-switch-to-login');

    // Encabezado
    const modalTitle = document.getElementById('modal-heading-title');
    const modalSubtitle = document.getElementById('modal-heading-subtitle');

    // Selector de roles
    const roleButtons = document.querySelectorAll('.modal-role-btn');
    const labelLoginUser = document.getElementById('modal-label-login-user');
    const inputLoginUser = document.getElementById('modal-login-user');
    const labelRegName = document.getElementById('modal-label-reg-name');
    const inputRegName = document.getElementById('modal-reg-name');
    const selectDocType = document.getElementById('modal-reg-doc-type');

    // Notificaciones / Alertas
    const modalAlert = document.getElementById('modal-alert');
    const alertMessage = document.getElementById('modal-alert-message');

    // Formularios
    const formLogin = document.getElementById('modal-form-login');
    const formRegister = document.getElementById('modal-form-register');

    let currentRole = 'candidato'; // 'candidato' | 'empresa'

    // ==========================================================
    // 1. APERTURA Y CIERRE DEL MODAL
    // ==========================================================

    function openAuthModal(targetTab = 'login') {
        if (!modalOverlay) return;
        modalOverlay.classList.add('active');
        modalOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setModalTab(targetTab);
    }

    function closeAuthModal() {
        if (!modalOverlay) return;
        modalOverlay.classList.remove('active');
        modalOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        hideAlert();
        clearAllErrors();
    }

    // Botón de cerrar (X)
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeAuthModal);
    }

    // Clic fuera de la tarjeta (en el fondo oscuro)
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeAuthModal();
            }
        });
    }

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeAuthModal();
        }
    });

    // Detectar botones o enlaces con data-auth-modal
    document.querySelectorAll('[data-auth-modal]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = trigger.getAttribute('data-auth-modal') || 'login';
            openAuthModal(tab);
        });
    });

    // Revisar hash en la URL al cargar
    if (window.location.hash === '#login') {
        openAuthModal('login');
    } else if (window.location.hash === '#registro' || window.location.hash === '#register') {
        openAuthModal('register');
    }

    // ==========================================================
    // 2. MANEJO DE PESTAÑAS (LOGIN vs REGISTRO)
    // ==========================================================

    function setModalTab(tabName) {
        hideAlert();
        clearAllErrors();

        if (tabName === 'register') {
            tabRegister?.classList.add('active');
            tabLogin?.classList.remove('active');

            viewRegister?.classList.add('active');
            viewLogin?.classList.remove('active');

            if (modalTitle) {
                modalTitle.textContent = currentRole === 'empresa' ? 'Registra tu Empresa' : 'Crea tu Cuenta';
            }
            if (modalSubtitle) {
                modalSubtitle.textContent = currentRole === 'empresa'
                    ? 'Publica convocatorias y selecciona talento con IA'
                    : 'Postúlate a las mejores vacantes y potencia tu perfil';
            }
        } else {
            tabLogin?.classList.add('active');
            tabRegister?.classList.remove('active');

            viewLogin?.classList.add('active');
            viewRegister?.classList.remove('active');

            if (modalTitle) modalTitle.textContent = 'Acceso a SIRH';
            if (modalSubtitle) modalSubtitle.textContent = 'Ingresa a tu cuenta para gestionar tus procesos';
        }
    }

    if (tabLogin) tabLogin.addEventListener('click', () => setModalTab('login'));
    if (tabRegister) tabRegister.addEventListener('click', () => setModalTab('register'));
    if (switchToRegister) switchToRegister.addEventListener('click', () => setModalTab('register'));
    if (switchToLogin) switchToLogin.addEventListener('click', () => setModalTab('login'));

    // ==========================================================
    // 3. SELECTOR DE ROLES (CANDIDATO vs EMPRESA)
    // ==========================================================

    roleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const role = btn.dataset.role;
            if (role === currentRole) return;

            currentRole = role;

            roleButtons.forEach(b => {
                b.classList.toggle('active', b.dataset.role === role);
            });

            if (role === 'empresa') {
                if (labelLoginUser) labelLoginUser.textContent = 'Correo corporativo o NIT';
                if (inputLoginUser) inputLoginUser.placeholder = 'empresa@contacto.com o NIT';
                if (labelRegName) labelRegName.textContent = 'Razón Social / Empresa';
                if (inputRegName) inputRegName.placeholder = 'Ej: Soluciones Globales S.A.S.';
                if (selectDocType) selectDocType.value = 'NIT';

                showAlert('Modo seleccionado: Empresa / Reclutador', 'info');
            } else {
                if (labelLoginUser) labelLoginUser.textContent = 'Correo o Identificación';
                if (inputLoginUser) inputLoginUser.placeholder = 'ejemplo@correo.com o documento';
                if (labelRegName) labelRegName.textContent = 'Nombre completo';
                if (inputRegName) inputRegName.placeholder = 'Ej: Juan Pérez Morales';
                if (selectDocType) selectDocType.value = 'CC';

                showAlert('Modo seleccionado: Candidato / Postulante', 'info');
            }

            if (viewRegister?.classList.contains('active')) {
                setModalTab('register');
            }
        });
    });

    // ==========================================================
    // 4. MOSTRAR / OCULTAR CONTRASEÑA
    // ==========================================================

    document.querySelectorAll('.modal-btn-toggle-pass').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const targetInput = document.getElementById(targetId);
            if (!targetInput) return;

            const iconEye = btn.querySelector('.icon-eye');
            const iconEyeOff = btn.querySelector('.icon-eye-off');

            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                iconEye?.classList.add('hidden');
                iconEyeOff?.classList.remove('hidden');
                btn.setAttribute('aria-label', 'Ocultar contraseña');
            } else {
                targetInput.type = 'password';
                iconEye?.classList.remove('hidden');
                iconEyeOff?.classList.add('hidden');
                btn.setAttribute('aria-label', 'Mostrar contraseña');
            }
        });
    });

    // ==========================================================
    // 5. ALERTAS Y VALIDACIONES
    // ==========================================================

    function showAlert(msg, type = 'info') {
        if (!modalAlert || !alertMessage) return;
        alertMessage.textContent = msg;
        modalAlert.className = `modal-alert ${type}`;
        modalAlert.classList.remove('hidden');
    }

    function hideAlert() {
        if (!modalAlert) return;
        modalAlert.classList.add('hidden');
    }

    function showError(inputElement, errorElementId, message) {
        if (inputElement) inputElement.classList.add('is-invalid');
        const errEl = document.getElementById(errorElementId);
        if (errEl) errEl.textContent = message;
    }

    function clearAllErrors() {
        document.querySelectorAll('.modal-input').forEach(input => input.classList.remove('is-invalid'));
        document.querySelectorAll('.modal-field-error').forEach(err => err.textContent = '');
    }

    document.querySelectorAll('.modal-input').forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('is-invalid');
            const errorSpan = input.closest('.modal-input-group')?.querySelector('.modal-field-error');
            if (errorSpan) errorSpan.textContent = '';
        });
    });

    // Enviar Login
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            clearAllErrors();
            hideAlert();

            let isValid = true;
            const userVal = inputLoginUser?.value.trim() || '';
            const passInput = document.getElementById('modal-login-password');
            const passVal = passInput?.value.trim() || '';

            if (!userVal) {
                showError(inputLoginUser, 'modal-error-login-user', 'Ingresa tu correo o número de identificación');
                isValid = false;
            }

            if (!passVal) {
                showError(passInput, 'modal-error-login-password', 'Ingresa tu contraseña');
                isValid = false;
            } else if (passVal.length < 6) {
                showError(passInput, 'modal-error-login-password', 'La contraseña debe tener mínimo 6 caracteres');
                isValid = false;
            }

            if (isValid) {
                const rolTexto = currentRole === 'empresa' ? 'Empresa' : 'Candidato';
                showAlert(`¡Bienvenido! Sesión iniciada exitosamente como ${rolTexto}.`, 'success');
                
                const submitBtn = document.getElementById('modal-btn-submit-login');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Ingresando...</span>';

                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    closeAuthModal();
                }, 1200);
            }
        });
    }

    // Enviar Registro
    if (formRegister) {
        formRegister.addEventListener('submit', (e) => {
            e.preventDefault();
            clearAllErrors();
            hideAlert();

            let isValid = true;
            const nameVal = inputRegName?.value.trim() || '';
            const docInput = document.getElementById('modal-reg-doc-num');
            const docVal = docInput?.value.trim() || '';
            const emailInput = document.getElementById('modal-reg-email');
            const emailVal = emailInput?.value.trim() || '';
            const phoneInput = document.getElementById('modal-reg-phone');
            const phoneVal = phoneInput?.value.trim() || '';
            const passInput = document.getElementById('modal-reg-password');
            const passVal = passInput?.value || '';
            const passConfInput = document.getElementById('modal-reg-password-confirm');
            const passConfVal = passConfInput?.value || '';
            const termsInput = document.getElementById('modal-reg-terms');

            if (!nameVal) {
                showError(inputRegName, 'modal-error-reg-name', currentRole === 'empresa' ? 'Ingresa la razón social' : 'Ingresa tu nombre completo');
                isValid = false;
            }

            if (!docVal) {
                showError(docInput, 'modal-error-reg-doc-num', 'Ingresa tu número de documento');
                isValid = false;
            }

            if (!emailVal || !emailVal.includes('@') || !emailVal.includes('.')) {
                showError(emailInput, 'modal-error-reg-email', 'Ingresa un correo electrónico válido');
                isValid = false;
            }

            if (!phoneVal) {
                showError(phoneInput, 'modal-error-reg-phone', 'Ingresa tu teléfono de contacto');
                isValid = false;
            }

            if (!passVal || passVal.length < 8) {
                showError(passInput, 'modal-error-reg-password', 'La contraseña debe contener al menos 8 caracteres');
                isValid = false;
            }

            if (!passConfVal || passVal !== passConfVal) {
                showError(passConfInput, 'modal-error-reg-password-confirm', 'Las contraseñas no coinciden');
                isValid = false;
            }

            if (!termsInput?.checked) {
                showError(null, 'modal-error-reg-terms', 'Debes aceptar los términos y condiciones');
                isValid = false;
            }

            if (isValid) {
                showAlert('¡Registro exitoso! Ya puedes iniciar sesión con tus credenciales.', 'success');
                
                const submitBtn = document.getElementById('modal-btn-submit-register');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Creando cuenta...</span>';

                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    formRegister.reset();
                    setModalTab('login');
                    showAlert('Registro completado. Ingresa con tus datos recién creados.', 'info');
                }, 1000);
            }
        });
    }

    // Botones sociales informativos
    document.querySelectorAll('.modal-social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showAlert('El acceso con redes estará habilitado próximamente.', 'info');
        });
    });

    // Enlace olvidar contraseña
    const linkForgot = document.getElementById('modal-link-forgot');
    if (linkForgot) {
        linkForgot.addEventListener('click', (e) => {
            e.preventDefault();
            showAlert('Contacta con soporte de SIRH para recuperar tu acceso.', 'info');
        });
    }
});
