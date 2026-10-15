/**
 * SIRH - Reclutamiento y Selección Inteligente
 * Lógica Integral de Autenticación, Registro y Gestión de Sesión
 * (js/main.js)
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================
    // 1. SERVICIO DE DATOS Y AUTENTICACIÓN (LocalStorage)
    // ==========================================================
    const STORAGE_USERS_KEY = 'sirh_users';
    const STORAGE_SESSION_KEY = 'sirh_session';

    // Cuentas iniciales por defecto (Seed Data)
    const DEFAULT_USERS = [
        {
            id: 'usr_demo_candidato',
            role: 'candidato',
            name: 'Carlos Mendoza',
            docType: 'CC',
            docNum: '12345678',
            email: 'candidato@sirh.com',
            phone: '+57 300 123 4567',
            password: 'password123',
            createdAt: '2026-10-10T09:00:00.000Z'
        },
        {
            id: 'usr_demo_empresa',
            role: 'empresa',
            name: 'Talento & Soluciones S.A.S.',
            docType: 'NIT',
            docNum: '900123456',
            email: 'empresa@sirh.com',
            phone: '+57 310 987 6543',
            password: 'password123',
            createdAt: '2026-10-12T14:30:00.000Z'
        }
    ];

    const AuthService = {
        // Inicializar usuarios en localStorage si no existen
        init() {
            try {
                const stored = localStorage.getItem(STORAGE_USERS_KEY);
                if (!stored) {
                    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
                } else {
                    const parsed = JSON.parse(stored);
                    if (!Array.isArray(parsed) || parsed.length === 0) {
                        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
                    }
                }
            } catch (err) {
                console.error('Error al inicializar AuthService:', err);
            }
        },

        // Obtener lista completa de usuarios
        getUsers() {
            try {
                const raw = localStorage.getItem(STORAGE_USERS_KEY);
                return raw ? JSON.parse(raw) : DEFAULT_USERS;
            } catch (err) {
                return DEFAULT_USERS;
            }
        },

        // Guardar lista completa
        saveUsers(users) {
            try {
                localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
                return true;
            } catch (err) {
                console.error('Error al guardar usuarios en almacenamiento:', err);
                return false;
            }
        },

        // Buscar usuario por correo electrónico O por número de documento
        findUser(identifier) {
            if (!identifier) return null;
            const term = identifier.trim().toLowerCase();
            const users = this.getUsers();
            return users.find(u => 
                (u.email && u.email.toLowerCase() === term) || 
                (u.docNum && u.docNum.toString().trim() === term)
            ) || null;
        },

        // Registrar nuevo usuario
        register(userData) {
            const users = this.getUsers();
            const emailLower = userData.email.trim().toLowerCase();
            const docNumTrim = userData.docNum.trim();

            // Validar unicidad de correo
            const existsEmail = users.some(u => u.email.toLowerCase() === emailLower);
            if (existsEmail) {
                return {
                    success: false,
                    field: 'email',
                    message: 'El correo electrónico ya está registrado. ¿Deseas iniciar sesión?'
                };
            }

            // Validar unicidad de documento
            const existsDoc = users.some(u => u.docNum && u.docNum.toString().trim() === docNumTrim);
            if (existsDoc) {
                return {
                    success: false,
                    field: 'docNum',
                    message: 'Este número de documento ya tiene una cuenta asociada en SIRH.'
                };
            }

            const newUser = {
                id: 'usr_' + Date.now(),
                role: userData.role || 'candidato',
                name: userData.name.trim(),
                docType: userData.docType || 'CC',
                docNum: docNumTrim,
                email: emailLower,
                phone: userData.phone.trim(),
                password: userData.password,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            this.saveUsers(users);

            return {
                success: true,
                user: newUser
            };
        },

        // Autenticar credenciales
        authenticate(identifier, password) {
            const user = this.findUser(identifier);
            if (!user) {
                return {
                    success: false,
                    field: 'user',
                    message: 'No existe una cuenta registrada con ese correo o documento.'
                };
            }

            if (user.password !== password) {
                return {
                    success: false,
                    field: 'password',
                    message: 'La contraseña ingresada es incorrecta. Por favor verifica tus datos.'
                };
            }

            return {
                success: true,
                user
            };
        },

        // Restablecer contraseña
        resetPassword(identifier, newPassword) {
            const users = this.getUsers();
            const term = identifier.trim().toLowerCase();
            const userIndex = users.findIndex(u => 
                (u.email && u.email.toLowerCase() === term) || 
                (u.docNum && u.docNum.toString().trim() === term)
            );

            if (userIndex === -1) {
                return {
                    success: false,
                    message: 'No encontramos ningún usuario con ese correo o número de documento.'
                };
            }

            users[userIndex].password = newPassword;
            users[userIndex].updatedAt = new Date().toISOString();
            this.saveUsers(users);

            return {
                success: true,
                user: users[userIndex]
            };
        },

        // Obtener la sesión activa actual
        getSession() {
            try {
                // Revisar localStorage primero, luego sessionStorage
                const local = localStorage.getItem(STORAGE_SESSION_KEY);
                if (local) return JSON.parse(local);

                const session = sessionStorage.getItem(STORAGE_SESSION_KEY);
                if (session) return JSON.parse(session);

                return null;
            } catch (err) {
                return null;
            }
        },

        // Guardar sesión activa
        setSession(user, remember = true) {
            const sessionData = {
                id: user.id,
                name: user.name,
                role: user.role,
                docType: user.docType,
                docNum: user.docNum,
                email: user.email,
                phone: user.phone,
                loginTime: new Date().toISOString()
            };

            try {
                if (remember) {
                    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
                    sessionStorage.removeItem(STORAGE_SESSION_KEY);
                } else {
                    sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
                    localStorage.removeItem(STORAGE_SESSION_KEY);
                }
            } catch (err) {
                console.error('Error al guardar sesión:', err);
            }
        },

        // Cerrar sesión
        clearSession() {
            try {
                localStorage.removeItem(STORAGE_SESSION_KEY);
                sessionStorage.removeItem(STORAGE_SESSION_KEY);
            } catch (err) {
                console.error('Error al limpiar sesión:', err);
            }
        }
    };

    // Inicializar almacén
    AuthService.init();

    // ==========================================================
    // 2. SISTEMA DE NOTIFICACIONES TOAST (UI Feedback)
    // ==========================================================
    const toastContainer = document.getElementById('sirh-toast-container');

    function showToast(message, type = 'info', duration = 3800) {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `sirh-toast ${type}`;

        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        } else if (type === 'error') {
            iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        } else {
            iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        }

        toast.innerHTML = `
            <div class="sirh-toast-icon">${iconSvg}</div>
            <div class="sirh-toast-content">${message}</div>
            <button type="button" class="sirh-toast-close" aria-label="Cerrar notificación">&times;</button>
        `;

        toast.querySelector('.sirh-toast-close').addEventListener('click', () => {
            removeToast(toast);
        });

        toastContainer.appendChild(toast);

        const autoTimer = setTimeout(() => {
            removeToast(toast);
        }, duration);

        function removeToast(el) {
            clearTimeout(autoTimer);
            el.classList.add('removing');
            setTimeout(() => {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 300);
        }
    }

    // ==========================================================
    // 3. REFERENCIAS DEL DOM (MODAL & FORMS)
    // ==========================================================
    const modalOverlay = document.getElementById('auth-modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Pestañas
    const tabLogin = document.getElementById('modal-tab-login');
    const tabRegister = document.getElementById('modal-tab-register');
    const viewLogin = document.getElementById('modal-view-login');
    const viewRegister = document.getElementById('modal-view-register');
    const viewRecovery = document.getElementById('modal-view-recovery');

    const switchToRegister = document.getElementById('modal-switch-to-register');
    const switchToLogin = document.getElementById('modal-switch-to-login');
    const switchBackLogin = document.getElementById('modal-switch-back-login');
    const linkForgot = document.getElementById('modal-link-forgot');

    // Títulos de Encabezado
    const modalTitle = document.getElementById('modal-heading-title');
    const modalSubtitle = document.getElementById('modal-heading-subtitle');

    // Selector de roles
    const roleButtons = document.querySelectorAll('.modal-role-btn');
    const labelLoginUser = document.getElementById('modal-label-login-user');
    const inputLoginUser = document.getElementById('modal-login-user');
    const labelRegName = document.getElementById('modal-label-reg-name');
    const inputRegName = document.getElementById('modal-reg-name');
    const selectDocType = document.getElementById('modal-reg-doc-type');

    // Notificaciones / Alertas dentro del modal
    const modalAlert = document.getElementById('modal-alert');
    const alertMessage = document.getElementById('modal-alert-message');

    // Formularios
    const formLogin = document.getElementById('modal-form-login');
    const formRegister = document.getElementById('modal-form-register');
    const formRecovery = document.getElementById('modal-form-recovery');

    // Elementos de Recuperación de contraseña
    const recoveryStep1 = document.getElementById('recovery-step-1');
    const recoveryStep2 = document.getElementById('recovery-step-2');
    const inputRecoveryUser = document.getElementById('modal-recovery-user');
    const inputRecoveryNewPass = document.getElementById('modal-recovery-newpass');
    const btnSubmitRecovery = document.getElementById('modal-btn-submit-recovery');
    const recoveryAccountName = document.getElementById('modal-recovery-account-name');
    const recoveryAccountRole = document.getElementById('modal-recovery-account-role');

    // Medidor de Contraseña
    const regPasswordInput = document.getElementById('modal-reg-password');
    const strengthContainer = document.getElementById('reg-password-strength-container');
    const strengthText = document.getElementById('str-text');

    // Referencias de Navbar y Sesión
    const navGuestActions = document.getElementById('nav-guest-actions');
    const navUserSession = document.getElementById('nav-user-session');
    const btnUserDropdown = document.getElementById('btn-user-dropdown');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');

    const navUserAvatar = document.getElementById('nav-user-avatar');
    const navUserName = document.getElementById('nav-user-name');
    const navUserRole = document.getElementById('nav-user-role');
    const dropdownAvatarSm = document.getElementById('dropdown-avatar-sm');
    const dropdownHeaderName = document.getElementById('dropdown-header-name');
    const dropdownHeaderEmail = document.getElementById('dropdown-header-email');
    const dropdownHeaderRole = document.getElementById('dropdown-header-role');
    const dropdownRoleQuickaction = document.getElementById('dropdown-role-quickaction');
    const btnDropdownLogout = document.getElementById('btn-dropdown-logout');
    const btnOpenProfile = document.getElementById('btn-open-profile');

    // Modal de Perfil de Usuario
    const profileModalOverlay = document.getElementById('profile-modal-overlay');
    const profileCloseBtn = document.getElementById('profile-close-btn');
    const btnProfileClose = document.getElementById('btn-profile-close');
    const btnProfileLogout = document.getElementById('btn-profile-logout');
    const profileAvatarLarge = document.getElementById('profile-avatar-large');
    const profileHeadingTitle = document.getElementById('profile-heading-title');
    const profileBadgeRole = document.getElementById('profile-badge-role');
    const profileEmailText = document.getElementById('profile-email-text');
    const profileDetailDoc = document.getElementById('profile-detail-doc');
    const profileDetailPhone = document.getElementById('profile-detail-phone');
    const profileDetailDate = document.getElementById('profile-detail-date');
    const profileRoleSection = document.getElementById('profile-role-section');

    let currentRole = 'candidato'; // 'candidato' | 'empresa'
    let verifiedRecoveryUser = null; // Para flujo de recuperación en 2 pasos

    // ==========================================================
    // 4. GESTIÓN DEL ESTADO DE SESIÓN EN LA INTERFAZ (UI)
    // ==========================================================

    function getInitials(name) {
        if (!name) return 'U';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    function formatDate(dateString) {
        if (!dateString) return 'Reciente';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    }

    function updateSessionUI() {
        const session = AuthService.getSession();

        if (session) {
            // Usuario Autenticado
            if (navGuestActions) navGuestActions.classList.add('hidden');
            if (navUserSession) navUserSession.classList.remove('hidden');

            const initials = getInitials(session.name);
            const roleLabel = session.role === 'empresa' ? 'Empresa' : 'Candidato';

            if (navUserAvatar) navUserAvatar.textContent = initials;
            if (navUserName) navUserName.textContent = session.name;
            if (navUserRole) navUserRole.textContent = roleLabel;

            if (dropdownAvatarSm) dropdownAvatarSm.textContent = initials;
            if (dropdownHeaderName) dropdownHeaderName.textContent = session.name;
            if (dropdownHeaderEmail) dropdownHeaderEmail.textContent = session.email;
            if (dropdownHeaderRole) dropdownHeaderRole.textContent = session.role === 'empresa' ? 'Empresa / Reclutador' : 'Candidato / Postulante';

            // Acción contextual según el rol en el dropdown
            if (dropdownRoleQuickaction) {
                if (session.role === 'empresa') {
                    dropdownRoleQuickaction.innerHTML = `
                        <button type="button" class="dropdown-item-btn" id="btn-quick-post-job">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                            <span>Publicar Vacante con IA</span>
                        </button>
                    `;
                } else {
                    dropdownRoleQuickaction.innerHTML = `
                        <button type="button" class="dropdown-item-btn" id="btn-quick-applications">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span>Mis Postulaciones (2 activas)</span>
                        </button>
                    `;
                }

                // Asignar listeners a la acción rápida
                const quickActionBtn = dropdownRoleQuickaction.querySelector('button');
                if (quickActionBtn) {
                    quickActionBtn.addEventListener('click', () => {
                        closeUserDropdown();
                        openProfileModal();
                    });
                }
            }
        } else {
            // Usuario Invitado (No autenticado)
            if (navGuestActions) navGuestActions.classList.remove('hidden');
            if (navUserSession) navUserSession.classList.add('hidden');
            closeUserDropdown();
            closeProfileModal();
        }
    }

    // Toggle Dropdown del usuario
    function toggleUserDropdown() {
        if (!userDropdownMenu) return;
        const isExpanded = btnUserDropdown?.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            closeUserDropdown();
        } else {
            openUserDropdown();
        }
    }

    function openUserDropdown() {
        if (!userDropdownMenu) return;
        userDropdownMenu.classList.remove('hidden');
        btnUserDropdown?.setAttribute('aria-expanded', 'true');
        btnUserDropdown?.classList.add('active');
    }

    function closeUserDropdown() {
        if (!userDropdownMenu) return;
        userDropdownMenu.classList.add('hidden');
        btnUserDropdown?.setAttribute('aria-expanded', 'false');
        btnUserDropdown?.classList.remove('active');
    }

    if (btnUserDropdown) {
        btnUserDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleUserDropdown();
        });
    }

    // Cerrar dropdown al hacer clic por fuera
    document.addEventListener('click', (e) => {
        if (userDropdownMenu && !userDropdownMenu.contains(e.target) && !btnUserDropdown?.contains(e.target)) {
            closeUserDropdown();
        }
    });

    // Logout
    function handleLogout() {
        AuthService.clearSession();
        closeUserDropdown();
        closeProfileModal();
        updateSessionUI();
        showToast('🔒 Has cerrado sesión correctamente. ¡Hasta pronto!', 'info');
    }

    if (btnDropdownLogout) btnDropdownLogout.addEventListener('click', handleLogout);
    if (btnProfileLogout) btnProfileLogout.addEventListener('click', handleLogout);

    // ==========================================================
    // 5. MODAL DE PERFIL DE USUARIO
    // ==========================================================

    function openProfileModal() {
        const session = AuthService.getSession();
        if (!session) {
            openAuthModal('login');
            return;
        }

        if (!profileModalOverlay) return;

        const initials = getInitials(session.name);
        const isEmpresa = session.role === 'empresa';

        if (profileAvatarLarge) profileAvatarLarge.textContent = initials;
        if (profileHeadingTitle) profileHeadingTitle.textContent = session.name;
        if (profileBadgeRole) profileBadgeRole.textContent = isEmpresa ? 'Empresa / Reclutador' : 'Candidato / Postulante';
        if (profileEmailText) profileEmailText.textContent = session.email;
        if (profileDetailDoc) profileDetailDoc.textContent = `${session.docType || 'DOC'}: ${session.docNum}`;
        if (profileDetailPhone) profileDetailPhone.textContent = session.phone || 'No registrado';
        if (profileDetailDate) profileDetailDate.textContent = formatDate(session.loginTime);

        // Sección específica según rol
        if (profileRoleSection) {
            if (isEmpresa) {
                profileRoleSection.innerHTML = `
                    <div class="profile-role-banner">
                        <h4>Métricas de Selección Empresarial</h4>
                        <span class="dropdown-tag-role">Plan Premium IA</span>
                    </div>
                    <div class="profile-metric-row">
                        <div class="profile-metric-pill">
                            <span class="metric-number">3</span>
                            <span class="metric-label">Vacantes Publicadas</span>
                        </div>
                        <div class="profile-metric-pill">
                            <span class="metric-number">18</span>
                            <span class="metric-label">Hojas de Vida Filtradas</span>
                        </div>
                        <div class="profile-metric-pill">
                            <span class="metric-number">94%</span>
                            <span class="metric-label">Compatibilidad IA</span>
                        </div>
                    </div>
                `;
            } else {
                profileRoleSection.innerHTML = `
                    <div class="profile-role-banner">
                        <h4>Estado de Postulaciones y Empleabilidad</h4>
                        <span class="dropdown-tag-role">Perfil Activo</span>
                    </div>
                    <div class="profile-metric-row">
                        <div class="profile-metric-pill">
                            <span class="metric-number">2</span>
                            <span class="metric-label">Procesos en Curso</span>
                        </div>
                        <div class="profile-metric-pill">
                            <span class="metric-number">88%</span>
                            <span class="metric-label">Match Promedio</span>
                        </div>
                        <div class="profile-metric-pill">
                            <span class="metric-number">1</span>
                            <span class="metric-label">CV Verificado</span>
                        </div>
                    </div>
                `;
            }
        }

        profileModalOverlay.classList.add('active');
        profileModalOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeProfileModal() {
        if (!profileModalOverlay) return;
        profileModalOverlay.classList.remove('active');
        profileModalOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (btnOpenProfile) {
        btnOpenProfile.addEventListener('click', () => {
            closeUserDropdown();
            openProfileModal();
        });
    }

    if (profileCloseBtn) profileCloseBtn.addEventListener('click', closeProfileModal);
    if (btnProfileClose) btnProfileClose.addEventListener('click', closeProfileModal);

    if (profileModalOverlay) {
        profileModalOverlay.addEventListener('click', (e) => {
            if (e.target === profileModalOverlay) closeProfileModal();
        });
    }

    // ==========================================================
    // 6. APERTURA Y CIERRE DEL MODAL DE AUTENTICACIÓN
    // ==========================================================

    function openAuthModal(targetTab = 'login') {
        const session = AuthService.getSession();
        if (session) {
            showToast(`Ya tienes una sesión activa como ${session.name}`, 'info');
            openProfileModal();
            return;
        }

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
        resetRecoveryView();
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeAuthModal);

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeAuthModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modalOverlay && modalOverlay.classList.contains('active')) closeAuthModal();
            if (profileModalOverlay && profileModalOverlay.classList.contains('active')) closeProfileModal();
            closeUserDropdown();
        }
    });

    // Detectar disparadores con [data-auth-modal] en cualquier parte de la página
    document.querySelectorAll('[data-auth-modal]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = trigger.getAttribute('data-auth-modal') || 'login';
            openAuthModal(tab);
        });
    });

    // Hash en la URL
    if (window.location.hash === '#login') {
        openAuthModal('login');
    } else if (window.location.hash === '#registro' || window.location.hash === '#register') {
        openAuthModal('register');
    }

    // ==========================================================
    // 7. GESTIÓN DE PESTAÑAS (LOGIN vs REGISTRO vs RECUPERACIÓN)
    // ==========================================================

    function setModalTab(tabName) {
        hideAlert();
        clearAllErrors();

        // Ocultar todas las vistas
        viewLogin?.classList.remove('active');
        viewRegister?.classList.remove('active');
        viewRecovery?.classList.remove('active');

        if (tabName === 'register') {
            tabRegister?.classList.add('active');
            tabLogin?.classList.remove('active');
            viewRegister?.classList.add('active');

            if (modalTitle) {
                modalTitle.textContent = currentRole === 'empresa' ? 'Registra tu Empresa' : 'Crea tu Cuenta';
            }
            if (modalSubtitle) {
                modalSubtitle.textContent = currentRole === 'empresa'
                    ? 'Publica convocatorias y selecciona talento con Inteligencia Artificial'
                    : 'Postúlate a las mejores vacantes y potencia tu perfil profesional';
            }
        } else if (tabName === 'recovery') {
            tabLogin?.classList.remove('active');
            tabRegister?.classList.remove('active');
            viewRecovery?.classList.add('active');

            if (modalTitle) modalTitle.textContent = 'Recuperar Contraseña';
            if (modalSubtitle) modalSubtitle.textContent = 'Restablece el acceso a tu cuenta de SIRH en simples pasos';
            resetRecoveryView();
        } else {
            // Login por defecto
            tabLogin?.classList.add('active');
            tabRegister?.classList.remove('active');
            viewLogin?.classList.add('active');

            if (modalTitle) modalTitle.textContent = 'Acceso a SIRH';
            if (modalSubtitle) modalSubtitle.textContent = currentRole === 'empresa'
                ? 'Ingresa con las credenciales de tu empresa u organización'
                : 'Ingresa con tu correo o documento para gestionar tus procesos';
        }
    }

    if (tabLogin) tabLogin.addEventListener('click', () => setModalTab('login'));
    if (tabRegister) tabRegister.addEventListener('click', () => setModalTab('register'));
    if (switchToRegister) switchToRegister.addEventListener('click', () => setModalTab('register'));
    if (switchToLogin) switchToLogin.addEventListener('click', () => setModalTab('login'));
    if (switchBackLogin) switchBackLogin.addEventListener('click', () => setModalTab('login'));

    if (linkForgot) {
        linkForgot.addEventListener('click', (e) => {
            e.preventDefault();
            setModalTab('recovery');
        });
    }

    // ==========================================================
    // 8. SELECTOR DE ROLES (CANDIDATO vs EMPRESA)
    // ==========================================================

    function setRole(role) {
        currentRole = role;
        roleButtons.forEach(b => {
            b.classList.toggle('active', b.dataset.role === role);
        });

        if (role === 'empresa') {
            if (labelLoginUser) labelLoginUser.textContent = 'Correo corporativo o NIT';
            if (inputLoginUser) inputLoginUser.placeholder = 'empresa@contacto.com o NIT';
            if (labelRegName) labelRegName.textContent = 'Razón Social / Organización';
            if (inputRegName) inputRegName.placeholder = 'Ej: Soluciones Globales S.A.S.';
            if (selectDocType) selectDocType.value = 'NIT';
            showAlert('Modo seleccionado: Empresa / Reclutador', 'info');
        } else {
            if (labelLoginUser) labelLoginUser.textContent = 'Correo o Identificación';
            if (inputLoginUser) inputLoginUser.placeholder = 'ejemplo@correo.com o documento';
            if (labelRegName) labelRegName.textContent = 'Nombre completo';
            if (inputRegName) inputRegName.placeholder = 'Ej: Carlos Mendoza Morales';
            if (selectDocType) selectDocType.value = 'CC';
            showAlert('Modo seleccionado: Candidato / Postulante', 'info');
        }

        if (viewRegister?.classList.contains('active')) {
            setModalTab('register');
        } else if (viewLogin?.classList.contains('active')) {
            setModalTab('login');
        }
    }

    roleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const role = btn.dataset.role;
            if (role !== currentRole) {
                setRole(role);
            }
        });
    });

    // ==========================================================
    // 9. ACCESOS RÁPIDOS DEMO (1 Clic para evaluar)
    // ==========================================================

    const btnDemoCandidato = document.getElementById('btn-demo-candidato');
    const btnDemoEmpresa = document.getElementById('btn-demo-empresa');

    if (btnDemoCandidato) {
        btnDemoCandidato.addEventListener('click', () => {
            setRole('candidato');
            setModalTab('login');
            if (inputLoginUser) inputLoginUser.value = 'candidato@sirh.com';
            const passInput = document.getElementById('modal-login-password');
            if (passInput) passInput.value = 'password123';
            clearAllErrors();
            showAlert('Credenciales de Candidato cargadas. Pulsa "Iniciar Sesión".', 'success');
        });
    }

    if (btnDemoEmpresa) {
        btnDemoEmpresa.addEventListener('click', () => {
            setRole('empresa');
            setModalTab('login');
            if (inputLoginUser) inputLoginUser.value = 'empresa@sirh.com';
            const passInput = document.getElementById('modal-login-password');
            if (passInput) passInput.value = 'password123';
            clearAllErrors();
            showAlert('Credenciales de Empresa cargadas. Pulsa "Iniciar Sesión".', 'success');
        });
    }

    // ==========================================================
    // 10. MOSTRAR / OCULTAR CONTRASEÑA
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
    // 11. MEDIDOR DE SEGURIDAD DE CONTRASEÑA EN REGISTRO
    // ==========================================================

    if (regPasswordInput && strengthContainer) {
        regPasswordInput.addEventListener('input', () => {
            const val = regPasswordInput.value;
            let score = 0;

            if (val.length >= 8) score++;
            if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;
            if (/\d/.test(val)) score++;
            if (/[^a-zA-Z0-9]/.test(val)) score++;

            strengthContainer.className = 'password-strength-container';

            if (!val) {
                if (strengthText) strengthText.textContent = 'Mínimo 8 caracteres';
            } else if (val.length < 8) {
                strengthContainer.classList.add('strength-weak');
                if (strengthText) strengthText.textContent = `Muy corta (${val.length}/8 car.)`;
            } else if (score <= 1) {
                strengthContainer.classList.add('strength-weak');
                if (strengthText) strengthText.textContent = 'Seguridad débil';
            } else if (score === 2) {
                strengthContainer.classList.add('strength-fair');
                if (strengthText) strengthText.textContent = 'Seguridad media';
            } else if (score === 3) {
                strengthContainer.classList.add('strength-good');
                if (strengthText) strengthText.textContent = 'Seguridad buena';
            } else {
                strengthContainer.classList.add('strength-strong');
                if (strengthText) strengthText.textContent = '¡Contraseña muy segura!';
            }
        });
    }

    // ==========================================================
    // 12. MENSAJES DE ALERTA Y ERRORES DE FORMULARIO
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

    // Limpiar error al tipear en cualquier input
    document.querySelectorAll('.modal-input').forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('is-invalid');
            const group = input.closest('.modal-input-group');
            const errorSpan = group ? group.querySelector('.modal-field-error') : null;
            if (errorSpan) errorSpan.textContent = '';
        });
    });

    // ==========================================================
    // 13. ENVÍO FUNCIONAL DEL FORMULARIO DE INICIO DE SESIÓN
    // ==========================================================

    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            clearAllErrors();
            hideAlert();

            let isValid = true;
            const userVal = inputLoginUser?.value.trim() || '';
            const passInput = document.getElementById('modal-login-password');
            const passVal = passInput?.value || '';
            const rememberCheck = document.getElementById('modal-login-remember');

            if (!userVal) {
                showError(inputLoginUser, 'modal-error-login-user', 'Ingresa tu correo o número de identificación');
                isValid = false;
            }

            if (!passVal) {
                showError(passInput, 'modal-error-login-password', 'Ingresa tu contraseña de acceso');
                isValid = false;
            } else if (passVal.length < 6) {
                showError(passInput, 'modal-error-login-password', 'La contraseña debe contener al menos 6 caracteres');
                isValid = false;
            }

            if (!isValid) return;

            // Intentar autenticación con el servicio
            const result = AuthService.authenticate(userVal, passVal);

            if (!result.success) {
                if (result.field === 'user') {
                    showError(inputLoginUser, 'modal-error-login-user', result.message);
                } else if (result.field === 'password') {
                    showError(passInput, 'modal-error-login-password', result.message);
                }
                showAlert(result.message, 'error');
                return;
            }

            // Autenticación Exitosa
            const loggedUser = result.user;
            const remember = rememberCheck ? rememberCheck.checked : true;
            AuthService.setSession(loggedUser, remember);

            const submitBtn = document.getElementById('modal-btn-submit-login');
            const originalText = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Verificando credenciales...</span>';
            }

            showAlert(`¡Bienvenido/a, ${loggedUser.name}! Accediendo al sistema...`, 'success');

            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
                formLogin.reset();
                closeAuthModal();
                updateSessionUI();
                showToast(`👋 ¡Bienvenido de nuevo, ${loggedUser.name}! Has ingresado como ${loggedUser.role === 'empresa' ? 'Empresa' : 'Candidato'}.`, 'success');
            }, 700);
        });
    }

    // ==========================================================
    // 14. ENVÍO FUNCIONAL DEL FORMULARIO DE REGISTRO
    // ==========================================================

    if (formRegister) {
        formRegister.addEventListener('submit', (e) => {
            e.preventDefault();
            clearAllErrors();
            hideAlert();

            let isValid = true;
            const nameVal = inputRegName?.value.trim() || '';
            const docTypeVal = selectDocType?.value || 'CC';
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

            // Validar Nombre / Razón Social
            if (!nameVal) {
                showError(inputRegName, 'modal-error-reg-name', currentRole === 'empresa' ? 'Ingresa la razón social de la empresa' : 'Ingresa tu nombre y apellidos');
                isValid = false;
            } else if (nameVal.length < 3) {
                showError(inputRegName, 'modal-error-reg-name', 'Debe contener al menos 3 caracteres');
                isValid = false;
            }

            // Validar Documento
            if (!docVal) {
                showError(docInput, 'modal-error-reg-doc-num', 'Ingresa el número de documento o NIT');
                isValid = false;
            } else if (docVal.length < 5) {
                showError(docInput, 'modal-error-reg-doc-num', 'Número de identificación demasiado corto');
                isValid = false;
            }

            // Validar Correo
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailVal) {
                showError(emailInput, 'modal-error-reg-email', 'Ingresa un correo electrónico');
                isValid = false;
            } else if (!emailRegex.test(emailVal)) {
                showError(emailInput, 'modal-error-reg-email', 'Formato de correo no válido (ej: usuario@dominio.com)');
                isValid = false;
            }

            // Validar Teléfono
            if (!phoneVal) {
                showError(phoneInput, 'modal-error-reg-phone', 'Ingresa un teléfono de contacto');
                isValid = false;
            } else if (phoneVal.length < 7) {
                showError(phoneInput, 'modal-error-reg-phone', 'El teléfono debe tener mínimo 7 dígitos');
                isValid = false;
            }

            // Validar Contraseña
            if (!passVal) {
                showError(passInput, 'modal-error-reg-password', 'Crea una contraseña segura');
                isValid = false;
            } else if (passVal.length < 8) {
                showError(passInput, 'modal-error-reg-password', 'La contraseña debe contener al menos 8 caracteres');
                isValid = false;
            }

            // Validar Confirmación
            if (!passConfVal) {
                showError(passConfInput, 'modal-error-reg-password-confirm', 'Confirma tu contraseña');
                isValid = false;
            } else if (passVal !== passConfVal) {
                showError(passConfInput, 'modal-error-reg-password-confirm', 'Las contraseñas no coinciden');
                isValid = false;
            }

            // Validar Términos
            if (!termsInput?.checked) {
                showError(null, 'modal-error-reg-terms', 'Debes aceptar los términos y condiciones de SIRH');
                isValid = false;
            }

            if (!isValid) return;

            // Intentar registro con el servicio
            const result = AuthService.register({
                role: currentRole,
                name: nameVal,
                docType: docTypeVal,
                docNum: docVal,
                email: emailVal,
                phone: phoneVal,
                password: passVal
            });

            if (!result.success) {
                if (result.field === 'email') {
                    showError(emailInput, 'modal-error-reg-email', result.message);
                } else if (result.field === 'docNum') {
                    showError(docInput, 'modal-error-reg-doc-num', result.message);
                }
                showAlert(result.message, 'error');
                return;
            }

            // Registro exitoso
            const submitBtn = document.getElementById('modal-btn-submit-register');
            const originalText = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Registrando cuenta...</span>';
            }

            showAlert('¡Registro exitoso! Tu cuenta ha sido creada correctamente.', 'success');

            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
                formRegister.reset();
                if (strengthContainer) strengthContainer.className = 'password-strength-container';
                if (strengthText) strengthText.textContent = 'Mínimo 8 caracteres';

                // Cambiar a la vista de login con el usuario prellenado
                setModalTab('login');
                if (inputLoginUser) {
                    inputLoginUser.value = emailVal;
                }
                const passLogin = document.getElementById('modal-login-password');
                if (passLogin) passLogin.focus();

                showAlert('¡Cuenta registrada! Ahora ingresa tu contraseña para iniciar sesión.', 'success');
                showToast(`✨ ¡Cuenta creada con éxito! Bienvenido a SIRH, ${nameVal}.`, 'success');
            }, 800);
        });
    }

    // ==========================================================
    // 15. RECUPERACIÓN DE CONTRASEÑA EN DOS PASOS
    // ==========================================================

    function resetRecoveryView() {
        verifiedRecoveryUser = null;
        if (recoveryStep1) recoveryStep1.classList.remove('hidden');
        if (recoveryStep2) recoveryStep2.classList.add('hidden');
        if (inputRecoveryUser) {
            inputRecoveryUser.value = '';
            inputRecoveryUser.disabled = false;
        }
        if (inputRecoveryNewPass) inputRecoveryNewPass.value = '';
        if (btnSubmitRecovery) btnSubmitRecovery.innerHTML = '<span>Buscar Cuenta</span>';
        clearAllErrors();
    }

    if (formRecovery) {
        formRecovery.addEventListener('submit', (e) => {
            e.preventDefault();
            clearAllErrors();
            hideAlert();

            // PASO 1: Buscar cuenta
            if (!verifiedRecoveryUser) {
                const searchVal = inputRecoveryUser?.value.trim() || '';
                if (!searchVal) {
                    showError(inputRecoveryUser, 'modal-error-recovery-user', 'Ingresa tu correo o número de identificación');
                    return;
                }

                const user = AuthService.findUser(searchVal);
                if (!user) {
                    showError(inputRecoveryUser, 'modal-error-recovery-user', 'No se encontró ninguna cuenta registrada con esos datos');
                    showAlert('Verifica el correo o número de identificación ingresado.', 'error');
                    return;
                }

                // Usuario Encontrado
                verifiedRecoveryUser = user;
                if (recoveryAccountName) recoveryAccountName.textContent = user.name;
                if (recoveryAccountRole) recoveryAccountRole.textContent = `(${user.role === 'empresa' ? 'Empresa' : 'Candidato'})`;

                if (recoveryStep1) recoveryStep1.classList.add('hidden');
                if (recoveryStep2) recoveryStep2.classList.remove('hidden');
                if (btnSubmitRecovery) btnSubmitRecovery.innerHTML = '<span>Guardar Nueva Contraseña</span>';

                showAlert(`Cuenta verificada: ${user.name}. Ingresa tu nueva contraseña.`, 'info');
                if (inputRecoveryNewPass) inputRecoveryNewPass.focus();
                return;
            }

            // PASO 2: Guardar nueva contraseña
            const newPass = inputRecoveryNewPass?.value || '';
            if (!newPass) {
                showError(inputRecoveryNewPass, 'modal-error-recovery-newpass', 'Ingresa la nueva contraseña');
                return;
            } else if (newPass.length < 8) {
                showError(inputRecoveryNewPass, 'modal-error-recovery-newpass', 'La contraseña debe contener al menos 8 caracteres');
                return;
            }

            const resetRes = AuthService.resetPassword(verifiedRecoveryUser.email, newPass);
            if (!resetRes.success) {
                showAlert(resetRes.message, 'error');
                return;
            }

            const savedUserEmail = verifiedRecoveryUser.email;
            showAlert('¡Contraseña actualizada con éxito! Ya puedes iniciar sesión con tu nueva clave.', 'success');
            showToast('🔑 Contraseña actualizada correctamente. Inicia sesión con tus nuevas credenciales.', 'success');

            setTimeout(() => {
                resetRecoveryView();
                setModalTab('login');
                if (inputLoginUser) inputLoginUser.value = savedUserEmail;
                const passLogin = document.getElementById('modal-login-password');
                if (passLogin) passLogin.focus();
            }, 1000);
        });
    }

    // ==========================================================
    // 16. BOTONES SOCIALES INFORMATIVOS
    // ==========================================================

    document.querySelectorAll('.modal-social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('ℹ️ El inicio de sesión con redes sociales estará disponible próximamente.', 'info');
        });
    });

    // ==========================================================
    // 17. INICIALIZACIÓN DE LA INTERFAZ AL CARGAR
    // ==========================================================

    updateSessionUI();

});
