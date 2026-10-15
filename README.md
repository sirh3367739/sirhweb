# 🚀 SIRH - Reclutamiento y Selección Inteligente

Plataforma web para la gestión moderna, ágil e inteligente de procesos de atracción, selección y contratación de talento humano impulsada por Inteligencia Artificial.

---

## 📁 Estructura del Proyecto

El proyecto está organizado de manera modular y limpia en las siguientes carpetas:

```text
sirhweb/
├── css/
│   ├── sirh.css             # Estilos globales y diseño del sitio
│   └── modal.css            # Estilos del modal interactivo de autenticación
├── img/
│   └── logo.png             # Logotipo y recursos visuales institucionales
├── js/
│   └── main.js              # Lógica interactiva (apertura del modal, pestañas, roles y validaciones)
├── README.md                # Documentación del proyecto y guía de Git
└── sirh.html                # Página principal con el módulo de login integrado
```

---

## 🔑 Módulo de Autenticación (Login, Registro y Gestión de Sesión)

El módulo de inicio de sesión y registro es **100% funcional** y cuenta con persistencia mediante `localStorage` y `sessionStorage`:

- **Registro Dinámico y Validado:**
  - Registro de **Candidatos** (Nombre completo, Documento CC/TI/CE/Pasaporte, Correo, Celular y Contraseña).
  - Registro de **Empresas** (Razón Social, NIT, Correo corporativo, Teléfono y Contraseña).
  - Medidor de seguridad de contraseña en tiempo real con niveles visuales.
  - Validación de unicidad de correo y número de documento (evita cuentas duplicadas).
  - Transición fluida con pre-llenado automático para iniciar sesión inmediatamente después de registrarse.

- **Inicio de Sesión Flexible y Seguro:**
  - Soporta ingreso tanto por **correo electrónico** como por **número de documento / NIT**.
  - Verificación de credenciales activas contra la base de datos local y opción *Recordar mi sesión*.
  - **Accesos Rápidos Demo:** Botones de un solo clic para cargar credenciales de prueba al instante.

- **Gestión de Sesión Activa y Perfil:**
  - Estado autenticado en el Navbar: reemplaza los botones de invitado por el badge de usuario con avatar, nombre y rol (*Candidato* o *Empresa*).
  - Menú desplegable interactivo con acceso directo a *Ver Mi Perfil*, accesos rápidos según el rol y *Cerrar Sesión*.
  - Modal de Perfil con datos del usuario, verificación de cuenta y métricas de selección o empleabilidad.
  - Notificaciones flotantes interactivas (*Toasts*) en la esquina superior con retroalimentación en tiempo real.

- **Recuperación de Contraseña:**
  - Flujo de restablecimiento en dos pasos: verificación de cuenta existente y asignación de nueva contraseña.

### 👥 Cuentas de Prueba Pre-registradas:

| Rol | Correo / Identificación | Contraseña | Nombre / Razón Social |
| :--- | :--- | :--- | :--- |
| **Candidato** | `candidato@sirh.com` o `12345678` | `password123` | Carlos Mendoza |
| **Empresa** | `empresa@sirh.com` o `900123456` | `password123` | Talento & Soluciones S.A.S. |

---

## 🛠️ Guía de Flujo de Trabajo en Git y GitHub

### 1. Crear y cambiarse a una nueva rama alternativa
Para trabajar en una nueva funcionalidad sin afectar la rama principal:

```bash
git checkout -b feature/nombre-de-tu-rama
```
> *Alternativa moderna:* `git switch -c feature/nombre-de-tu-rama`

### 2. Verificar el estado de los archivos modificados
```bash
git status
```

### 3. Agregar los cambios al área de preparación (Staging)
Para agregar todos los archivos creados o editados:

```bash
git add .
```

### 4. Guardar los cambios con un mensaje claro (Commit)
```bash
git commit -m "feat: descripción breve de lo que se implementó"
```

### 5. Subir la rama alternativa a GitHub (Push)
La primera vez que subes la rama, usa la bandera `-u` para vincularla con el repositorio remoto:

```bash
git push -u origin feature/nombre-de-tu-rama
```

### 6. Ver tus ramas locales y remotas
```bash
git branch -a
```

### 7. Cambiar entre ramas existentes
- Para volver a la rama principal:
  ```bash
  git checkout main
  ```
- Para volver a tu rama alternativa:
  ```bash
  git checkout feature/nombre-de-tu-rama
  ```

### 8. Crear un Pull Request en GitHub
Una vez hecho el `push`, entra a tu repositorio en GitHub:
1. Verás un aviso con el botón **"Compare & pull request"**.
2. Agrega una descripción de los cambios realizados.
3. Haz clic en **"Create pull request"**.
4. Una vez revisado, pulsa **"Merge pull request"** para unir los cambios con la rama `main`.

---

## 💻 Ejecución Local

Para visualizar el proyecto en tu navegador localmente:

1. Abre directamente el archivo `sirh.html` en tu navegador favorito (Chrome, Firefox, Safari, Edge), o
2. Inicia un servidor local ligero:
   ```bash
   python3 -m http.server 8080
   ```
   Luego ingresa a [http://localhost:8080/sirh.html](http://localhost:8080/sirh.html) en tu navegador.

---

*Proyecto formativo SIRH © 2026*
