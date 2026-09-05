FROM docker.io/library/node:20-alpine

# Sediakan openssl untuk kebutuhan biner Prisma Engine di Alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Samakan dengan port yang dipakai aplikasi Anda
EXPOSE 3001

CMD ["npm", "run", "dev"]
