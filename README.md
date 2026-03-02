# Linea
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/tonymocanu97/linea)

Linea is a full-stack industrial production monitoring application designed to track and visualize key manufacturing metrics. It provides real-time insights into production efficiency, equipment status, and quality control through an intuitive web-based dashboard.

The system is composed of a .NET backend that serves a RESTful API and an Angular single-page application for the user interface.

## Key Features

-   **Real-time Dashboard**: An overview of production metrics, including Overall Equipment Effectiveness (OEE), availability, performance, and quality gauges.
-   **Production Analytics**: Visual charts for analyzing production trends, efficiency over time, defect distribution, and energy consumption.
-   **Equipment Monitoring**: Track the status of individual machines (running, idle, maintenance, error), their production rates, and efficiency.
-   **Alerts System**: View active and historical alerts for downtimes and other critical events.
-   **Report Generation**: Create and download aggregated production data in CSV format based on various filters (date, shift, line, equipment).
-   **Equipment Management**: Add, configure, and manage production equipment through the UI.
-   **Authentication & RBAC**: JWT-based authentication with role-based access control. Three roles—Operator, Engineer, Supervisor—define hierarchical permissions. Supervisors can manage users; all authenticated users access dashboards and reports.
-   **AI Insights Assistant**: Natural language interface powered by OpenAI. Ask questions about production data, get predictive maintenance recommendations, or generate executive reports. Context is built from real dashboard data (summary, downtimes, equipment status).
-   **Data Simulation**: Includes a telemetry simulator to generate realistic sample data for development and testing purposes.

## Architecture

The project is structured into two main parts: a backend API and a frontend UI.

-   **`Linea/` (Backend)**: An ASP.NET Core Web API built with .NET 10. It follows principles of Clean Architecture, separating concerns into distinct projects:
    -   `Linea.Api`: The API layer with controllers and application entry point.
    -   `Linea.Application`: Contains application logic, interfaces, and Data Transfer Objects (DTOs).
    -   `Linea.Domain`: Core domain entities and enumerations.
    -   `Linea.Infrastructure`: Implements data persistence with Entity Framework Core and other external services.

-   **`LineaUI/` (Frontend)**: An Angular 21 application providing a responsive and interactive user experience.
    -   **State Management**: Utilizes RxJS with services for managing and sharing application state.
    -   **Styling**: Styled with Tailwind CSS for a modern and utility-first design system.
    -   **Component-based**: Organized into feature-specific pages and reusable UI components.

## Tech Stack

-   **Backend**: C#, .NET 10, ASP.NET Core, Entity Framework Core, PostgreSQL
-   **Frontend**: Angular 21, TypeScript, RxJS, Tailwind CSS, Lucide Icons
-   **Database**: PostgreSQL

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
-   [Node.js and npm](https://nodejs.org/) (v18 or higher)
-   [PostgreSQL](https://www.postgresql.org/download/)

### Backend Setup

1.  **Configure the Database**:
    -   Ensure your PostgreSQL server is running.
    -   Create a database (e.g., `linea_db`).
    -   Update the connection string in `Linea/Linea.Api/appsettings.json`:
        ```json
        "ConnectionStrings": {
          "LineaDb": "Host=localhost;Port=5432;Database=linea_db;Username=your_username;Password=your_password"
        }
        ```

2.  **Apply Database Migrations**:
    -   Navigate to the `Linea/Linea.Infrastructure` directory.
    -   Run the EF Core migration command to create the database schema:
        ```bash
        dotnet ef database update --startup-project ../Linea.Api
        ```

3.  **Run the Backend API**:
    -   Navigate to the root `Linea` directory.
    -   Run the application:
        ```bash
        dotnet run --project Linea.Api/Linea.Api.csproj
        ```
    -   The API will be available at `http://localhost:5203`.

### Frontend Setup

1.  **Navigate to the Frontend Directory**:
    ```bash
    cd LineaUI
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run the Development Server**:
    ```bash
    npm start
    ```

4.  **Access the Application**:
    -   Open your browser and navigate to `http://localhost:4200`.
    -   The Angular application is configured to proxy API requests from `/api` to the backend at `http://localhost:5203` (see `LineaUI/proxy.conf.json`).

### Data Simulation

To populate the application with sample data, you can enable the `TelemetrySimulatorService`.

1.  Open `Linea/Linea.Api/Program.cs`.
2.  Uncomment the following line:
    ```csharp
    // builder.Services.AddHostedService<TelemetrySimulatorService>();
    ```
3.  Restart the backend API. The service will now generate production reports, defects, and downtimes every few seconds.

### Authentication & RBAC

The application uses JWT-based authentication with three roles:

| Role       | Level | Permissions                                                                 |
|-----------|-------|-----------------------------------------------------------------------------|
| Operator  | 0     | View dashboards, reports, equipment, alerts                                 |
| Engineer  | 1     | Operator + equipment management, report generation                         |
| Supervisor| 2     | Engineer + user management (create, list, delete users)                    |

**Default users** (seeded on first run):

| Username   | Password     | Role      |
|-----------|--------------|-----------|
| operator  | operator123  | Operator  |
| engineer  | engineer123  | Engineer  |
| supervisor| supervisor123| Supervisor|

**Configuration**: JWT settings are in `Linea.Api/appsettings.json` under `Jwt`. The secret key should be changed in production. Users are seeded automatically when the database is created.

**Frontend**: Login page at `/login`, auth guard protects routes, supervisor guard restricts `/users` to Supervisors. Token is stored in `localStorage` and sent via `Authorization: Bearer` header.

### AI Insights

The AI Insights feature uses OpenAI's Chat Completions API (gpt-4o-mini) to answer natural language questions about production data.

**Setup**:

1.  Obtain an [OpenAI API key](https://platform.openai.com/api-keys).
2.  Configure the backend in one of two ways:
    -   Add to `Linea.Api/appsettings.json`:
        ```json
        "OpenAI": {
          "ApiKey": "sk-your-api-key-here"
        }
        ```
    -   Or set the environment variable: `OPENAI_API_KEY=sk-your-api-key-here`

3.  Restart the backend API.

**Usage**: Navigate to `/ai-insights` in the app. You can type questions or use quick actions such as "Predictive maintenance" or "Generate report". The assistant receives context from the current dashboard (summary, downtimes, equipment status) to provide relevant answers.