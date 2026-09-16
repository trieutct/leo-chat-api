# syntax=docker/dockerfile:1

# ===== Stage 1: build =====
# Cài đủ dependencies (kể cả devDependencies) để generate Prisma client và build TypeScript
FROM node:22-alpine AS build

WORKDIR /app

# Copy trước file lock để tận dụng cache layer khi source code thay đổi nhưng dependency không đổi
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy schema trước để cache layer generate Prisma client khi chỉ sửa source code
COPY prisma ./prisma
RUN yarn prisma:generate

COPY . .
RUN yarn build

# ===== Stage 2: production dependencies =====
# Cài lại chỉ production dependencies, tách riêng khỏi devDependencies để image gọn hơn
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# ===== Stage 3: runtime =====
FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

# Không chạy app bằng user root để giảm rủi ro bảo mật
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER nestjs

EXPOSE 3000

CMD ["node", "dist/src/main"]
