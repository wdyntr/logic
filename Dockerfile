FROM docker.io/library/node:20-alpine

# Sediakan openssl untuk kebutuhan biner Prisma Engine di Alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm config set fetch-retries 3 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retry-maxtimeout 60000 && \
    npm install --prefer-offline

COPY . .

# Samakan dengan port yang dipakai aplikasi Anda
EXPOSE 3001

CMD ["npm", "run", "dev"]
