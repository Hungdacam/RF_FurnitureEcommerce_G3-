@echo off
echo === Building Eureka Server ===

REM Build JAR file
echo Building JAR file...
call mvnw.cmd clean package -DskipTests

REM Kiểm tra JAR file
if not exist "target\eureka-server-*.jar" (
    echo Error: JAR file not found!
    exit /b 1
)

echo JAR file created successfully!

REM Build Docker image
echo Building Docker image...
docker build -t eureka-server:latest .

REM Kiểm tra image
docker images | findstr eureka-server
if %errorlevel% == 0 (
    echo Docker image built successfully!
    echo To run: docker run -p 8761:8761 eureka-server:latest
) else (
    echo Failed to build Docker image!
    exit /b 1
)
