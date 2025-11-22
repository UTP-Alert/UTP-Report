# UTP Reporta Backend

## Overview
This project is the backend service for the "UTP Reporta" application, a system designed to manage reports, incidents, and user interactions within the UTP environment. It provides a robust set of RESTful APIs, real-time notifications via WebSockets, and administrative functionalities to handle various types of reports and user roles.

## Technologies Used
The backend is built using the Spring Boot framework with Java 21 and leverages several key technologies:
*   **Spring Boot:** Framework for building robust, stand-alone, production-grade Spring applications.
*   **Spring Data JPA & Hibernate:** For efficient and object-relational mapping (ORM) database interactions.
*   **MySQL:** Relational database management system.
*   **Spring Security & JWT:** For secure authentication and authorization mechanisms using JSON Web Tokens.
*   **Spring WebSocket:** For real-time, bidirectional communication (e.g., notifications).
*   **Lombok:** To reduce boilerplate code (getters, setters, constructors).
*   **Springdoc OpenAPI UI:** For automatic generation and serving of API documentation (Swagger UI).
*   **Apache POI:** Library for reading and writing Microsoft Office files, primarily used for generating Excel reports.
*   **Spring Mail & Thymeleaf:** For sending rich HTML emails.
*   **Maven:** Build automation tool.

## Setup Instructions

### Prerequisites
Before running the application, ensure you have the following installed:
*   **Java Development Kit (JDK) 21** or higher
*   **Maven** 3.x or higher
*   **MySQL Server**
*   (Optional for local email testing) **MailHog** or a similar SMTP testing tool, if `spring.mail.host` is set to `localhost:1025`.

### Database Configuration
The application uses a MySQL database. You can configure the database connection in `src/main/resources/application.properties`.

Default configuration:
```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/db_utp_reporta?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC-5}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:1234}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=${SPRING_JPA_DDL_AUTO:update}
spring.jpa.show-sql=${SHOW_SQL:true}
spring.jpa.properties.hibernate.format_sql=${FORMAT_SQL:true}
```
It is recommended to create a database named `db_utp_reporta` in your MySQL server. The `ddl-auto: update` property will automatically create/update the schema based on your JPA entities. For production environments, consider setting `ddl-auto` to `validate` or `none` and managing schema migrations manually.

Environment variables `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `SPRING_JPA_DDL_AUTO`, `SHOW_SQL`, and `FORMAT_SQL` can be used to override these default values.

### Build and Run

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/utp-reporta-backend.git
    cd utp-reporta-backend
    ```
    (Note: Replace `https://github.com/your-repo/utp-reporta-backend.git` with the actual repository URL if different).

2.  **Build the project using Maven:**
    ```bash
    mvn clean install
    ```

3.  **Run the application:**
    You can run the application directly from the command line:
    ```bash
    mvn spring-boot:run
    ```
    Or, you can run the generated JAR file:
    ```bash
    java -jar target/utp-reporta-backend-0.0.1-SNAPSHOT.jar
    ```

The application will start on port 8080 by default.

## API Documentation (Swagger UI)
Once the application is running, you can access the interactive API documentation (Swagger UI) at:
`http://localhost:8080/swagger-ui-custom.html`

This interface allows you to explore all available endpoints, their parameters, and expected responses.

## Key Features

*   **User Authentication & Authorization:** Secure login (AuthService, AuthController), role-based access control (ERol enum, Spring Security).
*   **Report Management:** Creation, viewing, and management of reports (ReporteController, ReporteService).
*   **Real-time Notifications:** WebSocket-based notification system (NotificationService, WebSocketConfig).
*   **User Management:** Functionality for managing user accounts (UsuarioController, UsuarioService).
*   **Location/Zone Management:** Management of sedes (locations) and zones within them (SedeController, ZonaController).
*   **Incident Type Management:** Configuration of various incident types (TipoIncidenteController).
*   **Email Notifications:** Sending email alerts and confirmations (EmailService).
*   **Excel Export:** Generation of Excel reports using Apache POI.

## Project Structure
The project follows a standard Spring Boot application structure:

*   `com.utp_reporta_backend`: Main application package.
    *   `UtpReportaBackendApplication.java`: Entry point of the application.
    *   `config/`: Security, WebSocket, and data initialization configurations.
    *   `controller/`: REST API endpoints.
    *   `dto/`: Data Transfer Objects for API requests and responses.
    *   `enums/`: Enumerations for roles, states, etc.
    *   `filter/`: Custom filters (e.g., CORS).
    *   `model/`: JPA entities representing database tables.
    *   `repository/`: Spring Data JPA repositories for database access.
    *   `service/`: Business logic interfaces.
    *   `service/impl/`: Implementations of business logic.

## Contribution
(Add contribution guidelines here if applicable)

## License
(Add license information here if applicable)
