🌟 Microservices Magic with Spring Boot and ReactJS 🌟
🎉 Welcome to the Adventure!
Step into the vibrant world of this microservices-powered application! Built with the robust Spring Boot framework for the backend and the dazzling ReactJS for the frontend, this project is a dazzling showcase of modern software architecture. With MS SQL Server and PostgreSQL as its dynamic database duo, this repository is your gateway to a scalable, colorful ecosystem! Proudly owned and crafted by [Your Name].
🚀 Running the Backend (BE) and Frontend (FE) - Step-by-Step Guide
Prerequisites
Before you embark on this journey, ensure you have the following installed:

Docker and Docker Compose to orchestrate the containers.
Java 17 for the Spring Boot backend.
Node.js and npm for the ReactJS frontend.

Step 1: Clone the Repository
Start your adventure by cloning the repository:
git clone https://github.com/Hungdacam/RF_FurnitureEcommerce_G3-

Replace <repository-url> with the actual URL of your GitHub repository.
Step 2: Navigate to the Project Directory
Move into the project folder:
cd RF_FurnitureEcommerce_G3-

Replace RF_FurnitureEcommerce_G3- with the name of the cloned folder.
Step 3: Build and Run the Backend (BE)

Ensure all services are ready by building Docker images:
docker-compose up --build


This command builds and starts all microservices (e.g., eureka-server, user-service, api-gateway, etc.) along with databases (MS SQL Server and PostgreSQL) and Redis.
Wait for the services to initialize (this may take a few minutes as databases and services perform health checks).


Verify the backend is running:

Check the API Gateway at http://localhost:8900/actuator/health in your browser or using curl.
Look for a {"status":"UP"} response to confirm all services are healthy.



Step 4: Build and Run the Frontend (FE)

Open a new terminal window and navigate to the frontend directory:
cd frontend


Install frontend dependencies:
npm install


Build the ReactJS application for production:
npm run build


Start the frontend container (ensure Docker is still running from Step 3):

The frontend is already configured to build and run via Docker Compose under the frontend service. If not already running from docker-compose up, start it manually:docker-compose up frontend


Alternatively, use the provided Docker commands from package.json:npm run docker:build
npm run docker:run




Verify the frontend is running:

Open your browser and visit http://localhost:3000.
You should see the ReactJS application loaded and interacting with the backend.



Step 5: Troubleshooting

Backend Issues: Check Docker logs with docker-compose logs to identify any service failures. Ensure database initialization scripts in init-scripts executed successfully.
Frontend Issues: If the frontend fails to load, ensure the backend API Gateway is healthy and the docker-compose.yml file has the correct port mappings (e.g., 3000:80 for frontend).
Network Errors: Confirm no other applications are using ports 3000, 8900, 8761, etc.

Step 6: Stopping the Application
When you're done, stop and remove the containers:
docker-compose down

This cleans up resources but preserves data volumes (e.g., databases).
⚙️ Configuration: The Art of Setup

Database Initialization: SQL scripts are in init-scripts.
Environment Variables: Defined in docker-compose.yml for services like MS SQL Server and PostgreSQL.
Spring Profiles: Use the docker profile for containerized environment.

🤝 Contributing: Join the Creative Crew!
Fork this repository, paint your ideas with pull requests, and let’s create magic together. Follow the existing code structure and conventions to keep the harmony alive.
📜 License
This project dances under the MIT License – check the LICENSE file for the fine print.
🌈 Happy Coding!
May your code run smoothly and your microservices thrive! 🌟
