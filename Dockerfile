FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY src ./src

# Variable de entorno por defecto
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/server.js"]
