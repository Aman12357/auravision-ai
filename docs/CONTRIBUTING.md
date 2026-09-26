# Contributing to Aura Video AI

Thank you for your interest in contributing to **Aura Video AI**! We welcome contributions from developers, UI designers, and security researchers.

---

## Development Setup

### Prerequisites
- **Java 21 JDK**
- **Node.js 20+** & `npm`
- **Docker** & **Docker Compose**
- **Maven 3.9+**

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/aura-video-ai/aura-video-ai.git
   cd aura-video-ai
   ```
2. Run local setup script:
   ```bash
   ./scripts/setup-local.sh
   ```
3. Start infrastructure dependencies:
   ```bash
   docker-compose up -d postgres redis kafka
   ```
4. Run Flyway DB migrations:
   ```bash
   cd backend && mvn flyway:migrate
   ```
5. Start Spring Boot backend:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```
6. Start Next.js frontend:
   ```bash
   cd ../frontend && npm install && npm run dev
   ```

---

## Coding Standards

### Java / Spring Boot Backend
- Follow standard Java naming conventions and Google Java Style Guide.
- All entities must extend `BaseEntity`.
- Controllers must return `ApiResponse<T>` wrappers.
- Do NOT expose JPA entities directly in API endpoints; use DTO Records.
- Maintain full unit test coverage for services and AI provider implementations.

### TypeScript / Next.js Frontend
- Use strict TypeScript typing (no `any`).
- Follow Next.js App Router structure under `src/app/`.
- Styling: Pure Tailwind CSS using the design tokens defined in `tailwind.config.ts`.
- Components must support responsive breakpoints and dark mode styling.

---

## Pull Request Guidelines

1. Create a feature branch: `git checkout -b feature/my-new-feature`
2. Ensure unit tests pass:
   - Backend: `mvn test`
   - Frontend: `npm test`
3. Commit using conventional commit format: `feat: add support for Runway Gen-3 lip sync`
4. Open a Pull Request against `main`.
