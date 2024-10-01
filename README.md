# Proyecto de API para Gestión de Usuarios y Películas - NestJS

Este proyecto es una API desarrollada en **NestJS** que gestiona usuarios y películas, incluyendo autenticación y autorización mediante **JWT**. La API permite a los usuarios (administradores y regulares) realizar diversas acciones sobre los recursos de la base de datos.

## Tecnologías Utilizadas

- **NestJS**: Framework para Node.js.
- **TypeORM**: ORM para interactuar con bases de datos relacionales.
- **PostgreSQL**: Base de datos utilizada.
- **Docker**: Contenedores para gestionar la base de datos.
- **JWT (JSON Web Tokens)**: Autenticación y autorización.
- **Swagger**: Documentación automática de la API.

---

## Requisitos previos

Antes de comenzar, asegúrate de tener lo siguiente instalado en tu sistema:

- **Node.js** (v14 o superior)
- **Docker** (para levantar la base de datos)
- **npm** (Node Package Manager)

---

## Configuración del Proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/nadir-eliel/conexa.git
cd conexa
```

### 2. Instalar dependencias
Instala las dependencias del proyecto usando el siguiente comando:

```bash
npm install
```
### 3. Configurar las variables de entorno
Crea un archivo .env en la raíz del proyecto y asegúrate de definir las siguientes variables, a modo de ejemplo se dejan las mismas que coinciden con el Dockerfile:

.env
```bash
# Database
DB_HOST="localhost"
DB_PORT=5432
DB_USER="conexuser"
DB_PASS="p4ssw0rD"
DB_NAME="conexa"

# JWT
SECRET_KEY="secretJWT"

# Star Wars API
STAR_WARS_API="https://swapi.dev/api"
```

### 4. Levantar la base de datos con Docker
Este proyecto usa PostgreSQL como base de datos. Para levantarla con Docker, puedes usar el siguiente comando:

```bash
docker-compose up --build
```
Esto levantará la base de datos PostgreSQL y la inicializará con los valores definidos en el archivo docker-compose.yml.

### 5. Ejecutar el Proyecto
Para iniciar el servidor NestJS, usa el siguiente comando:

```bash
npm run start:dev
```
El servidor estará corriendo en http://localhost:3000.

### Documentación de la API
Esta API utiliza Swagger para generar la documentación automáticamente. Una vez que el servidor esté corriendo, puedes acceder a la documentación en:

```bash
http://localhost:3000/api
```