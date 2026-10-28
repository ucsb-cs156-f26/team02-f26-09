# Copilot Instructions for the Starter Team 02 Repository

## Context

This is a webapp with a Spring Boot backend, and a React frontend based on vite.

We use JUnit 5 for backend unit tests.

We use vitest for frontend tests.

## Code Standards

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

### Required Before Each Commit

#### frontend code (all code under `frontend/` directory)

- Use `npm run format` to format the frontend code using `prettier`
- Use `npx eslint --fix .` to fix any linting issues in the frontend code
- Use `npm test` to make sure that the frontend tests pass, and that there is full test coverage (100%)
- Use `npm run build` to ensure that there are no build errors in the frontend code.
- Use `npx stryker run` to ensure that all mutations are killed and that the mutation testing score is at 100%.

#### backend code (all code under src)

- Use `mvn test` to run the backend tests
- Use `mvn test jacoco:report` to generate a code coverage report and ensure that the coverage is 100%
- Use `mvn pitest:mutationCoverage` to ensure that all mutations are killed and that the mutation testing score is at 100%.

## Key Guidelines

1. Follow Spring Boot best practices and idiomatic patterns for Java Code
2. Follow React best practices and idiomatic patterns for frontend code
3. Maintain existing code structure and organization

## Working Effectively

### Bootstrap, Build, and Test the Repository

**CRITICAL**: NEVER CANCEL any build or test commands. All commands below have been validated with actual timing measurements.

#### Initial Setup (Required for Java 21)

```bash
# Install Java 21 (required - project uses Java 21, not Java 17)
sudo apt-get update && sudo apt-get install -y openjdk-21-jdk
sudo update-alternatives --config java  # Select Java 21 option (typically option 0 or 1)
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64

# Verify versions
java -version  # Should show Java 21
mvn -version   # Should show Java 21
node -v        # Should show Node.js 24.21.0 (see frontend/package.json engines)
npm -v
```

#### Backend Build and Test Commands

```bash
# Backend unit tests - NEVER CANCEL: Takes 3.5 minutes. Set timeout to 10+ minutes.
mvn test

# Backend integration tests - NEVER CANCEL: Takes 2 minutes. Set timeout to 15+ minutes.
# Note: Integration tests may show Playwright driver errors in CI environments - this is expected
INTEGRATION=true mvn test-compile failsafe:integration-test

# Production build - NEVER CANCEL: Takes 1.7 minutes. Set timeout to 10+ minutes.
PRODUCTION=true mvn -DskipTests clean dependency:list install
```

#### Frontend Build and Test Commands

```bash
cd frontend

# Frontend dependency installation - NEVER CANCEL: Takes 4.5 minutes. Set timeout to 15+ minutes.
npm ci

# Frontend unit tests - Takes 7 seconds. Set timeout to 5+ minutes.
CI=true npm test

# Frontend code formatting - Takes 1 second.
npm run format

# Storybook build - NEVER CANCEL: Takes 30 seconds. Set timeout to 5+ minutes.
npm run build-storybook
```

### Running the Application

#### Prerequisites

- Copy `.env.SAMPLE` to `.env`: `cp .env.SAMPLE .env`
- OAuth setup is required for login functionality (see `docs/oauth.md`)
- For basic testing without OAuth, the app will start but login will fail

#### Start Development Servers

```bash
# Terminal 1: Start backend server (takes 6 seconds to start)
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
mvn spring-boot:run

# Terminal 2: Start frontend development server (takes 30 seconds to start)
cd frontend
npm start
```

- Backend runs on: http://localhost:8080
- Frontend runs on: http://localhost:3000
- H2 Database console: http://localhost:8080/h2-console
- Swagger API docs: http://localhost:8080/swagger-ui/index.html

#### Running Storybook

```bash
cd frontend
npm run storybook
# Runs on http://localhost:6006
```

## Validation and Quality Assurance

### Always Run Before Committing

```bash
# Backend validation
mvn test

# Frontend validation
cd frontend
npm run format  # Code formatting
CI=true npm test  # Unit tests

# Full production build test
PRODUCTION=true mvn -DskipTests clean dependency:list install
```

### Manual Testing Requirements

- ALWAYS test backend startup: `mvn spring-boot:run` should start without errors
- ALWAYS test frontend startup: `npm start` should compile and serve on port 3000
- ALWAYS test at least one API endpoint via Swagger UI at http://localhost:8080/swagger-ui/index.html
- For OAuth functionality, requires proper Google OAuth setup (see `docs/oauth.md`)

## Architecture and Technology Stack

### Backend (Java 21 + Spring Boot)

- **Framework**: Spring Boot 3.4.3
- **Database**: H2 (development), PostgreSQL (production)
- **Authentication**: Google OAuth 2.0
- **API Documentation**: Swagger/OpenAPI
- **Testing**: JUnit 5, Mockito, Playwright (integration)
- **Build Tool**: Maven

### Frontend (React + Node.js)

- **Framework**: React 19
- **Node Version**: 24.21.0 required (`^24.21.0` in `frontend/package.json`)
- **UI Library**: React Bootstrap 5
- **State Management**: TanStack Query (React Query)
- **Testing**: Vite, React Testing Library
- **Documentation**: Storybook
- **Build Tool**: npm

### Database Access

- **Local Development**: H2 in-memory database
- **Console Access**: http://localhost:8080/h2-console
- **Connection**: `jdbc:h2:file:./target/db-development`
- **Production**: PostgreSQL via Dokku

## Known Issues and Workarounds

### Build Issues

- **Java Version**: Must use Java 21. Java 17 will cause build failures.
- **Node Version Warning**: Frontend shows engine warnings for Node outside `^24.21.0`; use `nvm use 24.21.0`
- **Integration Test Failures**: Playwright driver creation errors are expected in CI environments
- **Long Build Times**: Initial Maven builds download many dependencies (3+ minutes is normal)

### Development Issues

- **OAuth Required**: Login functionality requires Google OAuth setup
- **Frontend Proxy**: Frontend development server proxies API calls to backend on port 8080
- **Database Reset**: `mvn clean` completely rebuilds H2 database from scratch

## Directory Structure

```
.
├── .github/workflows/          # CI/CD pipelines
├── docs/                       # Documentation
├── frontend/                   # React application
│   ├── src/main/               # Application source
│   ├── src/tests/              # Test files
│   ├── src/stories/            # Storybook stories
│   └── package.json            # Frontend dependencies
├── src/main/java/              # Java source code
├── src/test/java/              # Java test code
├── .env.SAMPLE                 # Environment template
├── .java-version               # Java version (21)
└── pom.xml                     # Maven configuration
```

This repostiory has a Spring Boot backend and a React frontend.

## Repository Structure

- Top level follows the maven standard directory layout, except for the `frontend/` directory which contains the React frontend code.
- `src/main/java/`: Contains the main application code
- `src/main/resources/`: Contains configuration files and templates
- `src/test/java/`: Contains unit tests and integration tests
- `src/test/resources/`: Contains test resources and fixtures
- `frontend/`: Contains the React frontend code
- `frontend/src`: Code for the React frontend application
- `frontend/public`: Static assets for the React frontend application

## Common Validation Scenarios

### After Making Backend Changes

1. Run `mvn test` (3.5 minutes - NEVER CANCEL)
2. Start backend: `mvn spring-boot:run`
3. Test API via Swagger UI: http://localhost:8080/swagger-ui/index.html
4. Verify H2 console access: http://localhost:8080/h2-console

### After Making Frontend Changes

1. Run `cd frontend && npm run format`
2. Run `cd frontend && CI=true npm test`
3. Start frontend: `cd frontend && npm start`
4. Verify app loads at http://localhost:3000
5. Test basic navigation and UI functionality

### Before Pull Request

1. Full backend test: `mvn test` (NEVER CANCEL - 3.5 minutes)
2. Full frontend test: `cd frontend && CI=true npm test`
3. Production build: `PRODUCTION=true mvn -DskipTests clean install` (NEVER CANCEL - 1.7 minutes)
4. Manual smoke test: Start both backend and frontend, verify basic functionality

## CI/CD Pipeline Information

- GitHub Actions run on Java 21 with Node.js from package.json
- Backend tests timeout at 10 minutes
- Frontend tests timeout at 10 minutes
- Production build timeout at 10 minutes
- Integration tests may show Playwright errors (expected in CI)
