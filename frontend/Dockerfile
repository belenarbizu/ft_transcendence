FROM node:21-alpine3.17

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npx", "vite", "--host", "0.0.0.0"]