# ========= 阶段1：构建 =========
FROM node:20-alpine AS builder

# 使用国内镜像加速（可选）
RUN npm config set registry https://registry.npmmirror.com

WORKDIR /app

# 先复制依赖文件，利用缓存
COPY package.json pnpm-lock.yaml* ./

# 安装 pnpm 并安装依赖
RUN corepack enable && corepack prepare pnpm@latest --activate \
    && pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 生产构建
RUN pnpm run build

# ========= 阶段2：运行时 =========
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 解决 Vue Router history 模式 404 问题
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]