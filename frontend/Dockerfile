# Sử dụng Node.js phiên bản 18 làm base image
FROM node:18-alpine AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép các tệp cấu hình và cài đặt dependencies
COPY package.json package-lock.json ./
RUN npm install

# Sao chép toàn bộ mã nguồn
COPY . .

# Build ứng dụng cho production
RUN npm run build

# Sử dụng image nginx để phục vụ ứng dụng
FROM nginx:alpine

# Sao chép các tệp build từ bước trước vào nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Sao chép cấu hình nginx tùy chỉnh (nếu cần)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở cổng 80
EXPOSE 80

# Khởi động nginx
CMD ["nginx", "-g", "daemon off;"]