# Sử dụng image cơ sở OpenJDK 17
FROM openjdk:17-jdk-slim

# Đặt thư mục làm việc
WORKDIR /app

# Copy file JAR đã build vào container
COPY target/eureka-server-0.0.1-SNAPSHOT.jar app.jar

# Expose cổng mà Eureka Server sử dụng (mặc định là 8761)
EXPOSE 8761

# Lệnh để chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]