# Usamos la imagen oficial de PostgreSQL
FROM postgres:13

# Establecemos las variables de entorno para configurar la base de datos
ENV POSTGRES_USER=conexuser
ENV POSTGRES_PASSWORD=p4ssw0rD
ENV POSTGRES_DB=conexa

# Copiamos los scripts de inicialización (si los hubiera)
COPY ./init.sql /docker-entrypoint-initdb.d/

# Exponemos el puerto por defecto de PostgreSQL
EXPOSE 5432
