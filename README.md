# TaskFlow - Project Management Application

TaskFlow is a full-stack task management application that allows users to efficiently manage projects and tasks.

## Features

- **User Authentication**: Secure login and registration system
- **Project Management**: Create, update, and delete projects
- **Task Tracking**: Track tasks with statuses, due dates, and descriptions
- **Dashboard View**: Visualize project progress and task status
- **User Profiles**: Customize user information and preferences
- **Multiple Project Support**: Manage up to 4 projects per user
- **Dark/Light Mode**: Support for both dark and light themes

## Tech Stack

- **Frontend**: React.js with TailwindCSS and Shadcn UI components
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with bcrypt for password hashing
- **State Management**: TanStack React Query

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database

### Steps

1. Clone the repository
2. Install dependencies
3. Create a PostgreSQL database and set the environment variables
4. Push the database schema
5. Start the development server
6. Open `http://localhost:5000` in your browser

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login a user
- `POST /api/logout` - Logout a user
- `GET /api/user` - Get current user information

### Projects
- `GET /api/projects` - Get all projects for current user
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get a specific project
- `PATCH /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Tasks
- `GET /api/tasks` - Get all tasks for current user
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/:id/complete` - Mark a task as complete

## Database Schema

### Users
- `id` - Primary key
- `username` - Unique username
- `password` - Hashed password
- `firstName` - User's first name
- `lastName` - User's last name
- `email` - User's email address
- `emailNotifications` - Email notification preferences
- `darkMode` - UI theme preference

### Projects
- `id` - Primary key
- `name` - Project name
- `description` - Project description
- `status` - Project status (active, completed, on-hold)
- `userId` - Foreign key to users
- `createdAt` - Creation timestamp
- `dueDate` - Project deadline

### Tasks
- `id` - Primary key
- `title` - Task title
- `description` - Task description
- `status` - Task status (todo, in-progress, completed)
- `userId` - Foreign key to users
- `projectId` - Foreign key to projects
- `createdAt` - Creation timestamp
- `dueDate` - Task deadline
- `completed` - Completion status
- `completedAt` - Completion timestamp

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)  
