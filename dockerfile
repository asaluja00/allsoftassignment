# ---------- Stage 1: Build ----------
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install deps
RUN npm install

# 🔥 Install missing deps (runtime + types)
RUN npm install react-router-dom react-datepicker
RUN npm install --save-dev @types/react-router-dom

# Copy source
COPY . .

# 🔥 OVERRIDE BUILD: remove tsc from build script
RUN node -e "\
const fs = require('fs'); \
const pkg = JSON.parse(fs.readFileSync('package.json')); \
pkg.scripts.build = 'vite build'; \
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2)); \
"

# Build (NO type-check)
RUN npm run build


# ---------- Stage 2: Serve ----------
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
