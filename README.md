# Em-plor

Employee management system built with NestJS GraphQL API and Next.js frontend.

## 🏗️ Project Structure

This is a monorepo managed with pnpm workspaces containing:

- **`apps/api`** - NestJS GraphQL API server with TypeORM and SQLite
- **`apps/app`** - Next.js frontend application with Apollo Client
- **`packages/contracts`** - Shared TypeScript contracts and types

### Tech Stack

**Backend (API)**
- NestJS
- GraphQL (Apollo Server)
- TypeORM
- SQLite
- JWT Authentication
- Role-based Access Control (RBAC)
- Bcrypt

**Frontend (App)**
- Next.js 16
- React 19
- Apollo Client
- Tailwind CSS
- Zustand (State Management)
- Headless UI

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- pnpm (v8 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd em-plor
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the shared contracts:
```bash
pnpm --filter contracts build && pnpm add @em-plor/contracts -w
```

## 🏃 Running the Application

### Start the API Server

Run the API in debug mode:
```bash
pnpm --filter api start:debug
```

The GraphQL API will be available at:
- **GraphiQL Playground**: http://localhost:8080/graphql

### Start the Frontend App

Run the Next.js development server:
```bash
pnpm --filter app dev
```

The web application will be available at:
- **Frontend**: http://localhost:3000/

## 📦 Available Scripts

### Root Level
- `pnpm install` - Install all dependencies
- `pnpm --filter contracts build` - Build shared contracts package

### API (`apps/api`)
- `pnpm --filter api start` - Start API server
- `pnpm --filter api start:dev` - Start API with watch mode
- `pnpm --filter api start:debug` - Start API with debug mode
- `pnpm --filter api build` - Build API for production
- `pnpm --filter api test` - Run API tests

### App (`apps/app`)
- `pnpm --filter app dev` - Start development server
- `pnpm --filter app build` - Build for production
- `pnpm --filter app start` - Start production server

## 🗂️ Key Features

### API Features
- GraphQL API with type-safe schema
- Employee management (CRUD operations)
- Department and position management
- Employee attendance tracking
- Employee history management
- JWT-based authentication
- Role-based access control (RBAC):
  - **ADMIN**: Full access to create/update employees, view all employees
  - **MANAGER**: View employees reporting to them
  - **EMPLOYEE**: View only their own record
- Database seeding with Faker.js

### Frontend Features
- Authentication (Login/Logout)
- Employee dashboard
- Employee attendance visualization
- Employee history tracking
- Responsive design with Tailwind CSS
- Form validation

## 📁 Database

The API uses SQLite as the database. The database file will be created automatically when you first run the API server.

### Seeded Data

The database is automatically seeded with sample data on first run:

**Admin Account:**
- Email: `genesys.admin@example.com`
- Password: `password`
- Role: ADMIN
- Department: Executive
- Position: CTO

**Employee Data:**
- 100 randomly generated employees with varying roles
- Ages: 23-55 years old
- Departments: Executive, Engineering, Product, Sales, Marketing, Human Resources, Finance, Customer Support, Operations, Legal
- Positions: From Intern to CTO (11 position levels)
- Roles: EMPLOYEE (positions 0-5) and MANAGER (positions 6-10)

**Attendance Records:**
- 1 year of historical attendance data for each employee
- Weekdays only (Monday-Friday)
- 90% attendance probability per employee per day
- Check-in times: 7:00 AM - 10:00 AM (randomized)
- Work hours: 8-10 hours (randomized)

**Employee History:**
- Historical records of position and department changes
- Start dates generated for past 2 years

> **Note:** All seeded employee accounts use the default password `password`. Seed data is saved to `employees.json` and reused on subsequent runs to maintain consistency.

## 🔒 Access Control

The API implements role-based access control (RBAC) with three roles:

### Roles

- **ADMIN** - Full administrative access
- **MANAGER** - Manages team members
- **EMPLOYEE** - Standard employee access

### Authorization Rules

**Employee Mutations (`createEmployee`, `updateEmployee`)**:
- Authentication: Required (JWT)
- Authorization: ADMIN role only

**Employee Queries**:

- `employee` (single): No authentication required (public)
- `employees` (list):
  - Authentication: Required (JWT)
  - Authorization (data filtering):
    - **ADMIN**: Can view all employees
    - **MANAGER**: Can only view employees reporting to them (`reportsToId`)
    - **EMPLOYEE**: Can only view their own record

**Field Resolvers**:
- All relationship fields (`department`, `position`, `account`, `attendances`, `histories`) require authentication
- No additional role-based restrictions on field access

> **Note**: The mutations contain TODO comments to move authorization logic from inline checks to dedicated guards for better separation of concerns.

## 🔑 Environment Variables

Create appropriate `.env` files in each app directory if needed for configuration.

### Default Credentials

For testing and development purposes:

**Admin Login:**
- Email: `genesys.admin@example.com`
- Password: `password`

**Employee Accounts:**
- All seeded employee emails can be found in the generated `employees.json` file
- Default password for all accounts: `password`

> **⚠️ Security Warning:** The default password `password` is used for all accounts in development. This is set in the `EmployeeMutation.createEmployee` mutation and should be changed before deploying to production.

## 📝 Development Workflow

1. Make changes to shared contracts in `packages/contracts`
2. Rebuild contracts: `pnpm --filter contracts build`
3. The API and App will automatically use the updated contracts
4. Run both API and App concurrently for full-stack development

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

UNLICENSED
