# Storix ☁️

### Cloud Storage Metadata Management Platform

Storix is a cloud storage management platform designed to connect cloud storage accounts and organize file metadata through a unified interface. It aims to simplify file discovery, categorization, searching, and storage management without requiring users to store their actual cloud files in a separate database.

Built with **React, Spring Boot, and MySQL**, Storix combines a modern web interface with a REST API backend and Google OAuth authentication.

> **Project status:** Under active development.

---

## 📌 Table of Contents

* [Overview](#-overview)
* [Key Features](#-key-features)
* [How It Works](#-how-it-works)
* [Technology Stack](#-technology-stack)
* [Architecture](#-architecture)
* [Project Structure](#-project-structure)
* [Getting Started](#-getting-started)
* [Environment Configuration](#-environment-configuration)
* [API Overview](#-api-overview)
* [Security](#-security)
* [Future Improvements](#-future-improvements)
* [Contributing](#-contributing)
* [License](#-license)

---

## 🚀 Overview

Managing files across cloud storage services can become difficult when files are spread across different locations.

Storix aims to provide a centralized interface for accessing and managing file information. Instead of uploading cloud files into its own database, the application stores file metadata and uses cloud provider APIs to retrieve information about the original files.

The project currently focuses on Google OAuth integration, Google Drive integration, metadata synchronization, and a React-based user interface.

### Project Goals

* Provide a unified interface for cloud file management.
* Synchronize cloud file metadata with a relational database.
* Enable efficient searching and categorization of files.
* Keep actual file contents in their original cloud storage locations.
* Build a modular backend that can support additional storage providers in the future.

---

## ✨ Key Features

### 🔐 Authentication

* Google OAuth integration for connecting a Google account.
* User registration and login functionality.
* Backend authentication and authorization infrastructure.

### ☁️ Google Drive Integration

* Integration with the Google Drive API.
* Retrieval of file metadata from a connected Google account.
* Synchronization of cloud file information with the application's database.

### 📂 Metadata Management

* Store file information without duplicating the original file contents.
* Organize file records by properties such as name, type, and location.
* Support a searchable, centralized view of cloud file information.

### 🖥️ Web Interface

* React-based frontend.
* Component-based UI architecture.
* Frontend-to-backend communication through REST APIs.

### 🏗️ Extensible Architecture

* Spring Boot backend with separated application layers.
* MySQL database for persistent metadata.
* A foundation for integrating additional cloud storage providers.

> Feature availability may vary as development continues. Only features verified in the current implementation should be considered complete.

---

## 🔄 How It Works

The intended workflow is:

1. **Authenticate:** The user registers or logs in to Storix.
2. **Connect:** The user authorizes access to their Google account through OAuth.
3. **Retrieve:** The backend communicates with the Google Drive API to retrieve available file metadata.
4. **Synchronize:** Retrieved metadata is mapped to Storix's internal file model and persisted in MySQL.
5. **Display:** The React frontend requests file information from the backend and displays it to the user.
6. **Manage:** The user can discover and organize available file information through the application interface.

### Metadata vs. File Contents

Storix is designed to store metadata rather than duplicate the contents of cloud files.

Examples of metadata include:

* File ID
* File name
* MIME type
* File size
* Modification timestamp
* Parent folder information
* Cloud storage provider
* File location or provider reference

The exact metadata fields depend on the implementation and the information returned by the connected provider.

---

## 🛠️ Technology Stack

| Layer             | Technologies                             |
| ----------------- | ---------------------------------------- |
| Frontend          | React, JavaScript                        |
| Frontend tooling  | Vite                                     |
| Backend           | Java 21, Spring Boot                     |
| API               | REST APIs                                |
| Authentication    | Google OAuth 2.0, backend authentication |
| Database          | MySQL                                    |
| Cloud integration | Google Drive API                         |
| Build tools       | Maven, npm                               |
| Development tools | IntelliJ IDEA, VS Code, Git, GitHub      |

---

## 🏛️ Architecture

Storix follows a frontend-backend architecture.

```text
                  ┌─────────────────────────┐
                  │        User             │
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │     React Frontend      │
                  │                         │
                  │  UI Components          │
                  │  Authentication Pages   │
                  │  File Management Views  │
                  └────────────┬────────────┘
                               │
                         REST API / HTTP
                               │
                               ▼
                  ┌─────────────────────────┐
                  │   Spring Boot Backend   │
                  │                         │
                  │  Authentication         │
                  │  Business Logic         │
                  │  File Metadata Services │
                  │  Google Drive Integration│
                  └──────────┬──────────────┘
                             │
                  ┌──────────┴───────────┐
                  │                      │
                  ▼                      ▼
       ┌──────────────────┐  ┌────────────────────┐
       │    MySQL         │  │   Google Drive API │
       │                  │  │                    │
       │ Users            │  │ Cloud file metadata│
       │ File Metadata    │  │ Provider operations│
       │ Account Records  │  │                    │
       └──────────────────┘  └────────────────────┘
```

### Design Principles

* **Separation of concerns:** Frontend presentation, backend business logic, and persistence are separated.
* **API-driven communication:** The frontend communicates with the backend through HTTP endpoints.
* **Metadata persistence:** File records are stored separately from the original cloud file contents.
* **Extensibility:** Provider-specific functionality can be separated from common file management logic.

---

## 📁 Project Structure

The repository is organized into frontend and backend applications.

```text
Storix/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── contexts/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   ├── .env.example
│   └── vite.config.js
│
├── backend/
│   └── storix/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/
│       │   │   │   └── com/storix/storix/
│       │   │   └── resources/
│       │   └── test/
│       └── pom.xml
│
├── .gitignore
└── README.md
```

*This is a representative structure. Update it if your actual directory names differ.*

---

## ⚙️ Getting Started

Follow these steps to run Storix locally.

### Prerequisites

Install the following:

* Java 21
* Maven, or use the Maven Wrapper if available
* Node.js and npm
* MySQL Server
* A Google Cloud project with the required Google Drive API and OAuth configuration

Verify your installations:

```bash
java -version
mvn -version
node -v
npm -v
```

### 1. Clone the Repository

```bash
git clone https://github.com/Tarunendra103/Storix.git
cd Storix
```

### 2. Configure MySQL

Start your MySQL server and create a database for Storix.

```sql
CREATE DATABASE storix;
```

Configure the database connection using the environment variables expected by your Spring Boot configuration.

For example:

```text
DB_URL=jdbc:mysql://localhost:3306/storix
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
```

If your application uses different variable names, follow the existing backend configuration.

### 3. Configure the Backend

Navigate to the backend project:

```bash
cd backend/storix
```

Configure the required environment variables, including database credentials, Google OAuth credentials, and any authentication secrets used by your implementation.

Run the application:

```bash
mvn spring-boot:run
```

The backend will use the configured server port. If no custom port is configured, Spring Boot normally uses port `8080`.

### 4. Configure the Frontend

Open another terminal from the repository root:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a local `.env` file based on `.env.example`, if that example file is present.

For a local development setup, the frontend API base URL may look like:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Use the actual API base URL expected by the frontend.

Start the development server:

```bash
npm run dev
```

Vite will display the local URL in the terminal, commonly `http://localhost:5173`.

### 5. Connect Google OAuth

Configure Google OAuth in Google Cloud Console.

1. Select or create a Google Cloud project.
2. Enable the Google Drive API.
3. Configure the OAuth consent screen.
4. Create the appropriate OAuth client credentials.
5. Configure the authorized redirect URIs required by your backend.
6. Add the required environment variables to your local backend configuration.
7. Restart the backend and test the authentication flow.

OAuth settings must match the redirect URI and scopes implemented by the application.

---

## 🔑 Environment Configuration

Storix uses environment variables to configure sensitive credentials and environment-specific settings.

Examples of configuration values may include:

| Variable               | Purpose                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `DB_URL`               | MySQL connection URL                                                    |
| `DB_USERNAME`          | Database username                                                       |
| `DB_PASSWORD`          | Database password                                                       |
| `GOOGLE_CLIENT_ID`     | Google OAuth client identifier                                          |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                                              |
| `JWT_SECRET`           | Signing secret, if the implementation uses a shared-secret JWT strategy |
| `VITE_API_BASE_URL`    | Backend API base URL for the frontend                                   |

These names are examples. Use the exact variable names required by your code.

### Important Security Rules

* Never commit real passwords, OAuth client secrets, or signing secrets.
* Do not commit local `.env` files.
* Commit `.env.example` only with placeholder values.
* Configure production credentials through your deployment platform's secret or environment-variable settings.
* Do not expose backend-only secrets through frontend variables prefixed with `VITE_`.

---

## 🔌 API Overview

The backend exposes HTTP endpoints for authentication, account management, and file-related operations.

The exact endpoints and request formats should be verified against the current backend controllers.

| Area               | Purpose                                                     |
| ------------------ | ----------------------------------------------------------- |
| Authentication     | Registration, login, and authentication-related operations  |
| Connected Accounts | Connect and manage supported cloud accounts                 |
| File Management    | Retrieve and manage file metadata                           |
| Synchronization    | Retrieve and synchronize metadata from a connected provider |

The frontend communicates with the backend through its configured API base URL.

API routes, HTTP methods, request bodies, and response formats may change during development. Consult the backend controller classes for the current API contract.

---

## 🔒 Security

Security is an important consideration for a cloud-connected application.

The project should follow these practices:

* Protect authenticated endpoints with appropriate authorization checks.
* Keep OAuth client secrets and signing keys outside source control.
* Validate input received by backend endpoints.
* Apply appropriate CORS rules for the frontend origin.
* Request only the Google API permissions necessary for the application's functionality.
* Protect tokens and sensitive account information.
* Use HTTPS in production.
* Avoid logging access tokens, passwords, and client secrets.

Google OAuth consent-screen configuration and verification requirements depend on the scopes requested and the intended deployment.

---

## 🗺️ Future Improvements

Potential areas for further development include:

* [ ] Improve file metadata synchronization and error recovery.
* [ ] Expand search, filtering, and file categorization.
* [ ] Improve folder navigation and file organization.
* [ ] Implement reliable file previews and downloads using supported provider APIs.
* [ ] Add support for additional cloud storage providers.
* [ ] Improve automated testing and integration coverage.
* [ ] Add production deployment configuration.
* [ ] Add monitoring, logging, and operational health checks.
* [ ] Improve documentation and API reference material.

These are planned improvements, not claims that the features are already implemented.

---

## 🤝 Contributing

Contributions and suggestions are welcome.

To propose a change:

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes.
4. Test the affected functionality.
5. Submit a pull request describing the changes.

For larger changes, open an issue first to discuss the proposed implementation.

---

## 📄 License

No license has been specified in this README.

Before publishing Storix for public reuse, choose an appropriate open-source license and add the corresponding `LICENSE` file. Without a license, others generally do not receive explicit permission to reuse, modify, or distribute your code.

---

## 👨‍💻 Author

**Tarunendra Singh Parihar**

GitHub: [@Tarunendra103](https://github.com/Tarunendra103)

---

*Storix — bringing cloud file metadata management into one place.*
