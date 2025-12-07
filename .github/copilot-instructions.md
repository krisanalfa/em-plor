# GitHub Copilot Custom Instructions for Em-Plor

## Project Overview

Em-Plor is an employee management system built as a **pnpm monorepo** with:
- **Backend**: NestJS GraphQL API (`apps/api`)
- **Frontend**: Next.js 16 app (`apps/app`)
- **Shared**: TypeScript contracts package (`packages/contracts`)

## Architecture & Tech Stack

### Backend (apps/api)
- **Framework**: NestJS with TypeScript
- **API**: GraphQL using `@nestjs/graphql` and `@apollo/server`
- **Database**: TypeORM with SQLite
- **Authentication**: JWT-based auth (`@nestjs/jwt`)
- **Authorization**: CASL-based RBAC (Role-Based Access Control)
- **Password Hashing**: bcrypt
- **Module Structure**: Feature-based modules (auth, employee, department, positions)

### Frontend (apps/app)
- **Framework**: Next.js 16 with React 19
- **Routing**: App Router (Next.js 13+ style)
- **Styling**: Tailwind CSS 4
- **GraphQL Client**: Apollo Client (`@apollo/client`)
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Headless UI, Heroicons

### Shared (packages/contracts)
- TypeScript interfaces and types shared between frontend and backend
- CASL ability definitions for authorization
- Enums for roles, actions, and sortable fields

## Code Standards & Patterns

### TypeScript Configuration
- **API**: Uses `"moduleResolution": "nodenext"` with path aliases from project root (`src/`)
- **App**: Uses `"moduleResolution": "bundler"` with path aliases (`@/*` maps to root)
- **Strict mode**: Enabled across all packages
- **Decorators**: Experimental decorators enabled for NestJS

### Import Patterns

**API (NestJS):**
```typescript
// Absolute imports from src root
import { AccountEntity } from 'src/db/entities';
import { HashModule } from 'src/hash/hash.module';

// Shared contracts
import { Role, Action, AppAbility } from '@em-plor/contracts';
```

**App (Next.js):**
```typescript
// Path alias imports
import { apolloClient } from "@/lib/apollo";
import { useAuthStore } from "@/lib/stores/auth.store";

// Shared contracts
import { Role, IEmployee } from '@em-plor/contracts';
```

### NestJS Module Structure
- Use feature modules (e.g., `AuthModule`, `EmployeeModule`)
- Export necessary providers for other modules
- Import TypeORM entities with `TypeOrmModule.forFeature([Entity])`
- Structure: `*.module.ts`, `*.resolver.ts`, `*.mutation.ts`, `*.types.ts`

### GraphQL Patterns

**Resolvers:**
```typescript
@Resolver(() => EmployeeModel)
export class EmployeeResolver {
  @Query(() => [EmployeeModel])
  @UseGuards(AuthGuard, PoliciesGuard)
  @CheckPolicies(new ReadEmployeePolicyHandler())
  async employees() { }
}
```

**Mutations:**
```typescript
@Injectable()
export class EmployeeMutation {
  @Mutation(() => EmployeeModel)
  @UseGuards(AuthGuard, PoliciesGuard)
  @CheckPolicies(new CreateEmployeePolicyHandler())
  async createEmployee(@Args('input') input: CreateEmployeeInput) { }
}
```

### Authorization (CASL)
- Use `@CheckPolicies()` decorator with policy handlers
- Policy handlers implement `IPolicyHandler` interface
- Define abilities in `CaslAbilityFactory`
- Shared `AppAbility` type from `@em-plor/contracts`

### Next.js App Structure
- **App Router**: Use `app/` directory structure
- **Route Groups**: Use `(auth)` and `(dashboard)` for layout organization
- **Client Components**: Mark with `"use client"` directive
- **Layouts**: Separate `AuthLayout` and `DashboardLayout` components

### State Management
- **Zustand**: For global state (e.g., `auth.store.ts`)
- **Apollo Cache**: For GraphQL data
- **React Hook Form**: For form state

## Development Workflow

### Commands (use pnpm)
```bash
# Root level
pnpm install
pnpm --filter contracts build

# API
pnpm --filter api start:dev      # Development
pnpm --filter api start:debug    # Debug mode
pnpm --filter api test           # Tests

# App
pnpm --filter app dev            # Development
pnpm --filter app build          # Production build

# E2E Testing & Debugging with Playwright
pnpm --filter app test:e2e       # Run Playwright tests
pnpm --filter app test:e2e:ui    # Run Playwright with UI mode
pnpm --filter app test:e2e:debug # Debug Playwright tests
```

### Debugging with Playwright
- **Playwright** is configured for E2E testing and debugging the app
- **Test files** located in `apps/app/tests/`
- **Authentication**: Login page is pre-filled with credentials - just submit the form to authenticate
- **Debugging workflow**: 
  1. Start the app with `pnpm --filter app dev` (if not already running)
  2. Run Playwright in UI mode or debug mode
  3. Authentication is streamlined - pre-filled login form only requires clicking submit
- **Playwright config**: Located at `apps/app/playwright.config.ts`
- **Test reports**: Generated in `apps/app/playwright-report/`

### Database
- **SQLite** database file location in API
- **TypeORM entities** in `src/db/entities/`
- **Seeder service** available in `src/db/seeder.service.ts`
- Use decorators: `@Entity()`, `@Column()`, `@ManyToOne()`, etc.

### Environment Variables
- API GraphQL endpoint: `NEXT_PUBLIC_GRAPHQL_URI` (defaults to `http://localhost:8080/graphql`)
- JWT secret defined in `apps/api/src/graphql/auth/constants.ts`

## Entity Relationships
- **Account** → hasOne → Employee (via `accountId`)
- **Employee** → belongsTo → Department (via `departmentId`)
- **Employee** → belongsTo → Position (via `positionId`)
- **Employee** → hasMany → EmployeeAttendance
- **Employee** → hasMany → EmployeeHistory
- **Employee** → reportsTo → Employee (self-referential via `reportsToId`)

## Key Conventions

1. **File Naming**: 
   - Entities: `*.entity.ts`
   - Models (GraphQL): `*.model.ts`
   - Modules: `*.module.ts`
   - Guards: `*.guard.ts`
   - Decorators: `*.decorator.ts`

2. **Component Naming**: PascalCase for React components

3. **GraphQL Schema**: Auto-generated at `apps/api/schema.gql`

4. **Testing**: Jest configuration in both API and App packages

5. **Role Hierarchy**: ADMIN > MANAGER > EMPLOYEE

6. **Date Handling**: Use `Date` type, managed by TypeORM timestamps

## When Writing Code

### For API (NestJS):
- Always use dependency injection
- Apply appropriate guards (`AuthGuard`, `PoliciesGuard`)
- Use DTOs/Input types for GraphQL arguments
- Return GraphQL Model types from resolvers
- Handle errors with NestJS exception filters
- Use TypeORM repository pattern

### For Frontend (Next.js):
- Use Server Components by default, Client Components when needed
- Fetch data with Apollo Client hooks (`useQuery`, `useMutation`)
- Apply Tailwind CSS classes directly
- Use `classnames` for conditional classes
- Implement proper loading and error states
- Use React Hook Form with Zod for validation

### For Shared Contracts:
- Export interfaces prefixed with `I` (e.g., `IEmployee`)
- Define enums for fixed values (roles, actions, etc.)
- Keep types framework-agnostic
- Update when adding new entities or business logic

## Important Notes

- **Build Order**: Always build `@em-plor/contracts` before running API or App
- **GraphQL Playground**: Available at `http://localhost:8080/graphql`
- **Authentication**: JWT tokens stored in Zustand and sent via Apollo auth link
- **Permissions**: CASL policies enforce authorization at resolver level
