FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY src ./src

# Variables de entorno con valores por defecto (sobreescribibles en docker-compose o docker run)
ENV PORT=5000 \
    NODE_ENV=production \
    MONGO_URI=mongodb://mongo:27017/expense_tracker \
    JWT_SECRET=change_me_in_production \
    JWT_EXPIRES_IN=7d

EXPOSE 5000

CMD ["node", "src/server.js"]
