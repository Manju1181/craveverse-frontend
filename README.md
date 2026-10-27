# 🍽️ CraveVerse — Food Discovery & Delivery Application

**Your craving. Your universe.**

CraveVerse is a full-stack food discovery and delivery application that allows users to explore meals, filter food options, manage their basket, place orders, and track order status. It also includes an admin dashboard for viewing customer orders and managing order statuses.

## ✨ Features

### 👨‍🍳 Customer Features
- **Smart Food Search:** Explore food options based on preferences.
- **Cuisine Filters:** Discover Indian, South Indian, Asian, Healthy, Italian, and Fast Food options.
- **Budget Filter:** Find meals within a preferred budget.
- **Preparation-Time Filter:** Explore meals according to available time.
- **Vegetarian Filter:** Filter vegetarian options.
- **Food Cards:** View food images, descriptions, restaurant names, prices, ratings, and estimated preparation times.
- **Favourites:** Save preferred meals.
- **Basket Management:** Add meals and manage quantities.
- **Order Placement:** Place food orders through the application.
- **My Orders:** View personal order history and order status.
- **Responsive Design:** Use the application across different screen sizes.

### 🛡️ Admin Features
- **Order Dashboard:** View customer orders.
- **Order Management:** Review orders and update their status.
- **Access Control:** Protect admin-only operations using backend session checks.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, JavaScript (ES6+), HTML5, CSS3 |
| Frontend Tooling | Vite, Lucide React |
| Backend | Java, Spring Boot |
| API | REST APIs |
| Database | MySQL |
| Build Tool | Maven |
| Version Control | Git and GitHub |

## 🏗️ Application Architecture

CraveVerse uses a three-layer architecture:

1. **Frontend:** The React application provides the customer interface and admin dashboard.
2. **Backend:** Spring Boot exposes REST endpoints, processes application requests, and handles order-management operations.
3. **Database:** MySQL stores application data, including food items and customer orders.

The frontend communicates with the backend through HTTP requests, and the backend interacts with MySQL.

## 🚀 Getting Started

Follow these instructions to run CraveVerse locally.

### Prerequisites

Install the following:
- [Node.js](https://nodejs.org/)
- npm
- Java Development Kit (JDK) compatible with the backend project
- Git
- MySQL Server

### 1. Clone the repositories

**Frontend:**

```bash
git clone https://github.com/Manju1181/craveverse-frontend.git
cd craveverse-frontend
```

**Backend:**

Open another terminal and run:

```bash
git clone https://github.com/Manju1181/craveverse-backend.git
cd craveverse-backend
```

### 2. Configure the database

Create a MySQL database named `craveverse` if it does not already exist:

```sql
CREATE DATABASE craveverse;
```

Configure the database connection in the backend's `src/main/resources/application.properties`.

The backend expects the database password to be supplied through the `DB_PASSWORD` environment variable. Set it in your terminal before starting the backend.

**macOS/Linux:**

```bash
export DB_PASSWORD='your_mysql_password'
```

Replace the example value with your local MySQL password. Never commit your actual password to GitHub.

### 3. Start the backend

In the backend terminal:

```bash
./mvnw spring-boot:run
```

The backend should start at:

```text
http://localhost:8080
```

### 4. Start the frontend

In the frontend terminal:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

Keep both development servers running while using the application.

> **Note:** Local setup instructions assume the backend's database settings and frontend API configuration are compatible with your environment. Update configuration if your local ports or database settings differ.

## 📦 Production Build

To create a production build of the frontend:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 📁 Frontend Project Structure

```text
craveverse-frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

The backend is maintained in a separate repository.

## 🔐 Security Notes

- Database credentials should be provided through environment variables.
- Do not commit `.env` files, passwords, or other secrets.
- Admin-only operations should be protected by server-side authorization checks.
- Production deployment should use HTTPS and appropriate session and CORS configuration.

## 🔮 Future Improvements

- Deploy the frontend and backend.
- Add automated tests for API endpoints and order workflows.
- Improve validation and error handling.
- Add payment integration using an appropriate payment provider.
- Improve production authentication and authorization.

## 👨‍💻 Author

**Manjunath Uppar**

- GitHub: [@Manju1181](https://github.com/Manju1181)

### Project Repositories

- [CraveVerse Frontend](https://github.com/Manju1181/craveverse-frontend)
- [CraveVerse Backend](https://github.com/Manju1181/craveverse-backend)

---

*Built with React, Java, Spring Boot, and MySQL.*
