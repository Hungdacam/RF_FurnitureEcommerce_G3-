FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/order-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8812
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8812/api/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]