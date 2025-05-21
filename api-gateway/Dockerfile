# Sử dụng image base Java 17
FROM eclipse-temurin:17-jdk-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file pom.xml và mã nguồn
COPY pom.xml .
COPY src ./src

# Copy file cấu hình
COPY src/main/resources/application.properties ./src/main/resources/

# Cài đặt Maven để build ứng dụng
RUN apk add --no-cache maven

# Build dự án
RUN mvn clean package -DskipTests

# Copy file JAR đã build vào container
RUN cp target/api-gateway-0.0.1-SNAPSHOT.jar app.jar

# Mở cổng 8900
EXPOSE 8900

# Lệnh chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]