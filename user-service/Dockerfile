FROM openjdk:17-jdk-slim

# Cài đặt các tools cần thiết
RUN apt-get update && apt-get install -y \
    curl \
    procps \
    net-tools \
    iproute2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8811

ENTRYPOINT ["java", "-jar", "app.jar"]
