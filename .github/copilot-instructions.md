<!-- Copied-to/maintained-by: AI agent -->
# Copilot / AI Agent Instructions — DatingApp

Purpose: concise, actionable guidance for an AI coding agent to be productive in this repository.

- **Project layout (high level):**
  - `API/` — ASP.NET Core Web API (controllers, EF Core DbContext, DTOs, services).
  - `client/` — Angular frontend (Angular CLI v20, runs on `http://localhost:4200`).
  - `DatingApp.sln` — solution file; primary workflows run against `API/` and `client/`.

- **Architecture & data flow:**
  - HTTP endpoints live under `API/Controllers/*`. Routes follow `api/[controller]` via `BaseApiController`.
  - `API/Data/AppDbContext.cs` exposes `DbSet<AppUser> Users` and uses SQLite (connection in `appsettings.Development.json`).
  - Authentication: JWT via `API/Services/TokenService.cs` + `API/Interface/ITokenService.cs`. Tokens created with `TokenKey` in configuration. Controllers consume `ITokenService` by DI.
  - Passwords are hashed with `HMACSHA512` and stored as `PasswordHash` + `PasswordSalt` on `API/Entities/AppUser.cs`.

- **Notable code patterns / conventions** (important for edits and PRs):
  - Controllers use C# primary constructor syntax (e.g. `public class AccountController(AppDbContext context, ITokenService tokenService) : BaseApiController`). Match this style when adding controllers.
  - DTOs are in `API/DTO/` and map to `Entities` manually in controllers (no AutoMapper present).
  - Explicit interface implementation used in `TokenService` (`string ITokenService.CreateToken(AppUser user)`). When refactoring, keep interface signature and implementation consistent.
  - Route configuration is centralized in `API/Controllers/BaseApiController.cs` (`[Route("api/[controller]")]`).

- **Dev / run / debug commands** (Windows / PowerShell):
  - Build the solution:
    ```pwsh
    dotnet build DatingApp.sln
    ```
  - Run the API (from repo root):
    ```pwsh
    dotnet run --project API
    ```
  - Run the Angular client:
    ```pwsh
    cd client
    npm install
    npm run start    # runs `ng serve` (dev server on http://localhost:4200)
    ```
  - Apply EF migrations (if modifying models):
    ```pwsh
    # if you don't have the EF tool
    dotnet tool install --global dotnet-ef
    dotnet ef database update --project API --startup-project API
    ```

- **Configuration & environment**
  - Dev DB and token: see `API/appsettings.Development.json` — `ConnectionStrings:DefaultConnection` points to `dating.db` and `TokenKey` is present in dev config. Do NOT commit production secrets.
  - CORS: configured in `API/Program.cs` to allow `http://localhost:4200` and `https://localhost:4200`.

- **Integration points & external dependencies**
  - Database: SQLite via EF Core (migrations present in `API/Data/Migrations/`).
  - Frontend: Angular (CLI v20). The client expects backend at `http://localhost:5000`/`http://localhost:<dotnet-port>`; CORS settings enable `localhost:4200`.

- **What to look for when editing or adding features**
  - Keep DI usage consistent — services are added in `Program.cs` (e.g. `AddScoped<ITokenService, TokenService>()`). Register new services there.
  - When adding endpoints, add DTOs under `API/DTO/` and map explicitly in controller methods.
  - When changing auth claims or token lifetime, update both `TokenService.cs` and any client code that depends on claim names.
  - Database model changes should be accompanied by an EF migration and a small smoke test that exercises the affected endpoint.

- **Files to reference for examples**
  - `API/Program.cs` — DI, authentication, CORS, DbContext registration.
  - `API/Controllers/AccountController.cs` — registration/login flow, password hashing example.
  - `API/Services/TokenService.cs` — JWT creation and claims used (`ClaimTypes.Email`, `ClaimTypes.NameIdentifier`).
  - `API/Data/AppDbContext.cs` and `API/Data/Migrations/` — EF patterns and migration artifacts.
  - `client/README.md` and `client/package.json` — frontend dev commands.

- **Quick PR checklist for AI-generated code**
  - Ensure new C# code compiles (`dotnet build`).
  - Add or update EF migration when changing entities; include `dotnet ef` commands in PR description.
  - Validate login/register flows manually (run API + `ng serve`) when touching auth.
  - Avoid adding secrets to `appsettings.*.json`; prefer environment variables or user secrets for local testing.

If anything above is unclear or you want more detail (example PR templates, test harness, or code snippets to enforce patterns), tell me which area to expand and I will update this file.
