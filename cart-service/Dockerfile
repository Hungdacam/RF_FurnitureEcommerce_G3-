# Stage 1: Build ứng dụng
FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file pom.xml và mã nguồn
COPY pom.xml .
COPY src ./src

# Build dự án, bỏ qua test
RUN mvn clean package -DskipTests

# Stage 2: Chạy ứng dụng
FROM eclipse-temurin:17-jdk-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file JAR từ stage builder
COPY --from=builder /app/target/cart-service-0.0.1-SNAPSHOT.jar app.jar

# Mở cổng 8902
EXPOSE 8902

# Lệnh chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]