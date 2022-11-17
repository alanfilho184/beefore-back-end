FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

ENV PORT=3001

EXPOSE 3001

CMD ["npm", "run", "build-start"]