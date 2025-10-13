# Sistema de Gestión de Libre Deuda - Juzgado de Faltas Municipal

Este sistema permite a los ciudadanos consultar si poseen multas de tránsito pendientes. En caso de adeudar infracciones, deberán dirigirse al Juzgado de Faltas correspondiente para abonarlas. Si no registran deudas, el sistema generará un certificado de libre deuda listo para imprimir.

## Tecnologías utilizadas

    Frontend: React con Vite para una experiencia ágil y fluida.
    Backend: Laravel para la gestión de datos y validaciones.
    Base de Datos: MySQL para almacenamiento estructurado.
    Seguridad: Implementación de QR para validaciones.
    UI/UX: Flowbite para componentes visuales y TanStack Query para gestión eficiente de datos.

---

### 1. Clonar repositorio

```bash
git clone https://github.com/sfvc/libre-deuda.git
```

### 2. Ingresar a la carpeta

```bash
cd libre-deuda
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Agregar variables de entorno

```bash
VITE_API_URL=http://localhost:8000/api
VITE_X_API_TOKEN=###
VITE_GOTENBERG_API_URL=###
```

### 5. Levantar el servidor

```bash
npm run dev
```
