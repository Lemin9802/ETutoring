```markdown
# ETutoring - API & Infrastructure

This module serves as the authoritative data and logic layer for the ETutoring ecosystem. It is designed to expose secure, scalable RESTful services that power the frontend client.

### Technical Highlights
* **Tutor Listing & Search Services:** Architected high-performance API endpoints to handle complex, multi-parameter filtering for tutor directories, optimizing database query execution times.
* **Relational Data Modeling:** Designed a structured database schema capable of sustaining the complex many-to-many relationships inherent in scheduling and user-role management.
* **Secure API Architecture:** Implemented strict routing constraints, payload validation, and secure authentication protocols to safeguard sensitive educational records.
* **Algorithmic Problem Solving:** Independently resolved critical backend bugs related to asynchronous data fetching and data integrity during concurrent scheduling requests.

### Local Environment Setup

The backend requires the .NET SDK and a running SQL database instance. After navigating to the backend directory and restoring dependencies, you must securely configure your local database connection string and third-party credentials (AWS, Google OAuth) inside a local, git-ignored `appsettings.Development.json` file to prevent secret exposure. Once the security configuration is complete, apply the Entity Framework migrations to build the database schema and launch the server. Use the workflow below to initialize the backend services:

```bash
cd Back-end
dotnet restore
# Ensure appsettings.Development.json is created with your DB Connection, AWS, and Google credentials
dotnet ef database update
dotnet run
