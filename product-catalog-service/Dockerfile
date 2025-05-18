FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/product-catalog-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8810
ENTRYPOINT ["java", "-jar", "app.jar"]