@echo off
echo === Building API Gateway ===

REM Kiểm tra Maven wrapper
if not exist "mvnw.cmd" (
    echo Creating Maven wrapper...
    call mvn -N io.takari:maven:wrapper
)

REM Clean và build JAR file
echo Building JAR file...
call mvnw.cmd clean package -DskipTests

REM Kiểm tra JAR file
for %%f in (target\api-gateway-*.jar) do (
    if exist "%%f" (
        echo ✅ JAR file created: %%f
        goto :build_docker
    )
)

echo ❌ Error: JAR file not found!
exit /b 1

:build_docker
REM Build Docker image
echo Building Docker image...
docker build -t api-gateway:latest .

REM Kiểm tra image
docker images | findstr api-gateway
if %errorlevel% == 0 (
    echo ✅ Docker image built successfully!
    echo.
    echo To run standalone:
    echo docker run -p 8900:8900 -e EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://host.docker.internal:8761/eureka api-gateway:latest
    echo.
    echo To run with docker-compose:
    echo cd .. ^&^& docker-compose up api-gateway
) else (
    echo ❌ Failed to build Docker image!
    exit /b 1
)

echo.
echo Build completed!
pause
