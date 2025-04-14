# Etapa de construcción
FROM node:22-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app


ARG VITE_API_URL

ENV VITE_API_URL=$VITE_API_URL

ARG VITE_X_API_TOKEN

ENV VITE_X_API_TOKEN=$VITE_X_API_TOKEN

# Copiar archivos de configuración e instalación de dependencias
# Copiar el resto del código
COPY . ./
RUN npm install --force
#RUN npm install -g typescript

# Construir la aplicación
RUN npm run build


# Etapa de producción
FROM nginx:alpine

# Copiar los archivos construidos desde la etapa de construcción
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar un archivo de configuración de Nginx personalizado si es necesario
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto en el que se sirve la aplicación
EXPOSE 80

# Comando por defecto para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]