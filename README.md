# Advanced Tasks Management

This is a simple task management application built with React, TypeScript, and Tailwind CSS. It allows users to create, update, and delete tasks, as well as manage their authentication state.

## Features

- User authentication with JWT tokens
- Task management (CRUD operations)
- Responsive design using Tailwind CSS

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Axios for API requests
- Django REST Framework for the backend
- PostgreSQL for the database

## Setup Instructions

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd task-management-app
    ```
2.  Docker setup:

    - Ensure Docker is installed and running.
    - Build the Docker images:
      ```bash
      docker-compose build
      ```
    - Start the services:
      `bash
docker-compose up
`
      create a superuser:

      ```bash
      docker-compose exec backend python manage.py createsuperuser --username sathishkumar --email sathishkumar@example.com --password zaqwer321!
      ```

go to `http://localhost:3000` in your browser to access the application.
login with the credentials:

- Username: `sathishkumar`
- Password: `zaqwer321!`
