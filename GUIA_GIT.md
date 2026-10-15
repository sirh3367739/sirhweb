# 📘 Guía Rápida de Git: Subir a Ramas Alternativas

Esta guía resume los pasos y comandos para gestionar ramas en Git y subirlas a GitHub.

---

## 📌 Paso a Paso: Flujo de Trabajo con Ramas Alternativas

### 1. Crear y moverse a la nueva rama
```bash
git checkout -b feature/nombre-de-la-rama
```
*Ejemplo:*
```bash
git checkout -b feature/login-modal
```

---

### 2. Verificar el estado de los cambios
```bash
git status
```

---

### 3. Preparar los archivos (Staging)
```bash
git add .
```

---

### 4. Crear el commit
```bash
git commit -m "feat: mensaje descriptivo de los cambios"
```

---

### 5. Subir la rama a GitHub
```bash
git push -u origin feature/nombre-de-la-rama
```
*Ejemplo:*
```bash
git push -u origin feature/login-modal
```

---

## 🔄 Comandos Frecuentes para Ramas

| Acción | Comando |
| :--- | :--- |
| **Ver todas las ramas** | `git branch` |
| **Cambiar a la rama main** | `git checkout main` |
| **Volver a tu rama de trabajo** | `git checkout feature/login-modal` |
| **Descargar últimos cambios de GitHub** | `git pull origin main` |
| **Eliminar rama local (después de fusionar)** | `git branch -d feature/login-modal` |

---

## 🚀 Fusionar con `main` (Pull Request)

1. Ve a tu repositorio en GitHub: `https://github.com/sirh3367739/sirhweb`
2. Presiona el botón verde **Compare & pull request**.
3. Confirma los cambios y presiona **Create pull request**.
4. Haz clic en **Merge pull request** para incorporar los cambios a `main`.
