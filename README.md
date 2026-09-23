# Sistema de costurera

Aplicación para registrar clientes, medidas corporales y generar presupuestos.

## Requisitos previos

- Node.js (v18 o mayor)
- MongoDB corriendo en local (puerto 27017)

## Arrancar el proyecto

### 1. Backend

```bash
cd backend
cp .env.example .env        # Copia la configuración
npm install                  # Instala dependencias
node seed.js                 # Crea el usuario admin (solo la primera vez)
node server.js               # Arranca el servidor
```

El backend queda en: http://localhost:5000

**Usuario por defecto:**
- Email: `admin@costurera.com`
- Contraseña: `admin123`

### 2. Frontend

Abre otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La app queda en: http://localhost:5173

---

## Estructura del proyecto

```
costurera/
├── backend/
│   ├── models/
│   │   ├── User.js        # Usuarios (admin y cliente)
│   │   ├── Cliente.js     # Datos de clientes
│   │   └── Medidas.js     # Medidas corporales
│   ├── routes/
│   │   ├── auth.js        # Login
│   │   ├── clientes.js    # CRUD de clientes
│   │   └── medidas.js     # Guardar/obtener medidas
│   ├── middleware/
│   │   └── auth.js        # Verificación de token JWT
│   ├── server.js          # Servidor principal
│   └── seed.js            # Script para crear admin inicial
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.jsx   # Estado de sesión global
        ├── components/
        │   ├── Navbar.jsx        # Barra de navegación
        │   └── RutaProtegida.jsx # Protege rutas que requieren login
        ├── pages/
        │   ├── Login.jsx         # Pantalla de inicio de sesión
        │   ├── Clientes.jsx      # Lista y gestión de clientes
        │   └── Medidas.jsx       # Medidas de un cliente
        ├── api.js                # Configuración de axios
        └── App.jsx               # Rutas de la aplicación
```

## Para agregar acceso a clientes en el futuro

1. En `backend/routes/auth.js`: ya soporta el campo `rol` ('admin' o 'cliente')
2. En `backend/middleware/auth.js`: usar `soloAdmin` en rutas que solo el admin puede ver
3. En `frontend/components/RutaProtegida.jsx`: pasar `rol="admin"` para restringir rutas
4. Crear en frontend las páginas que el cliente puede ver (solo sus medidas, sus pedidos)
