FROM openjdk:17-jdk-slim

# Cài đặt curl cho health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ARG JAR_FILE=target/api-gateway-*.jar
COPY ${JAR_FILE} api-gateway.jar
EXPOSE 8900

ENV JAVA_OPTS="-Xmx1024m -Xms512m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
CMD curl -f http://localhost:8900/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar api-gateway.jar"]