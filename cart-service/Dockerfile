FROM openjdk:17-jdk-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8902

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]
