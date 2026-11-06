FROM node:20-alpine     # Vوالفقla node:22-alpine yapabilirsiniz
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "app.js"]
