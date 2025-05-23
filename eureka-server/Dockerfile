FROM openjdk:17-jdk-slim

# Cài đặt curl cho healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file JAR vào container
ARG JAR_FILE=target/eureka-server-*.jar
COPY ${JAR_FILE} eureka-server.jar

# Expose port
EXPOSE 8761

# Thiết lập JVM options
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Chạy ứng dụng
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar eureka-server.jar"]
