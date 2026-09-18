Development of Smart Procurement & Purchase Order Management System

A full-stack web-based Enterprise Procurement System designed to
digitize the procurement lifecycle --- from employee purchase requests
and admin approval to purchase order processing, payment, supplier
fulfilment, delivery tracking, reports, and feedback.

📌 Project Overview

The system provides a centralized procurement workflow for three main
user roles:

Employee -- creates purchase requests, tracks requests/orders,
and provides feedback.

Admin -- manages users, products, suppliers, requests,
approvals, payments, and procurement activities.

Supplier -- manages supplier products and processes approved and
paid orders through fulfilment and delivery stages.

The application uses an Angular frontend, Spring Boot backend, and MySQL
database.

✨ Key Features

Secure login and role-based access for Employee, Admin, and Supplier

Employee purchase request creation and tracking

Admin purchase request review and approval/rejection

Product, category, department, and supplier management

Purchase order workflow

Payment initiation and payment status tracking

MPIN-based payment verification for supported payment flows

Supplier order processing and delivery-status updates

Delivery tracking from confirmation through completion

Product reviews and feedback

Role-based dashboards

Purchase request export in CSV, PDF, and Excel formats

Notifications and procurement status visibility

🧩 Functional Modules

1. User & Access Management

Authentication, role-based access, employee/admin/supplier management,
and role-specific dashboards.

2. Procurement Management

Purchase request creation, review, approval/rejection, purchase order
workflow, and status tracking.

3. Product & Supplier Management

Product catalog, categories, departments, supplier profiles, and
supplier products.

4. Payment Management

Payment initiation, payment method selection, payment processing,
payment status/history, and MPIN verification where applicable.

5. Delivery & Order Tracking

Order confirmation, packing, shipping, delivery completion, and tracking
visibility.

6. Dashboard, Reports & Feedback

Role-based dashboards, procurement/payment summaries, reports,
CSV/PDF/Excel exports, reviews, and feedback.

🔄 End-to-End Workflow

Employee Login
↓
Create Purchase Request
↓
Admin Review
↓
Approve / Reject
↓
Purchase Order
↓
Payment Processing
↓
Supplier Fulfilment
↓
Order Confirmation
↓
Packing
↓
Shipping
↓
Delivery
↓
Feedback / Reports

🛠️ Technology Stack

Frontend

Angular

TypeScript

HTML5

CSS3

Backend

Java

Spring Boot

REST APIs

Spring Security

JWT Authentication

Database & Persistence

MySQL

Spring Data JPA

Hibernate

Development & Tools

IntelliJ IDEA

Visual Studio Code

Maven

Git

GitHub

Postman

🏗️ System Architecture

┌──────────────────────────────┐
│      Angular Frontend        │
│   HTML • CSS • TypeScript    │
└──────────────┬───────────────┘
│ REST API
▼
┌──────────────────────────────┐
│         Spring Boot          │
│ Controllers • Services       │
│ Security • JWT               │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│   Spring Data JPA /          │
│        Hibernate             │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│           MySQL              │
│      Procurement Data        │
└──────────────────────────────┘

📁 Project Structure

EnterpriseProcurementSystem/
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/eps/enterpriseprocurementsystem/
│       │       ├── controller/
│       │       ├── dto/
│       │       ├── entity/
│       │       ├── enums/
│       │       ├── exception/
│       │       ├── repository/
│       │       ├── security/
│       │       └── service/
│       │
│       └── resources/
│           └── application.properties
│
├── frontend/
├── pom.xml
└── README.md

⚙️ Local Setup

Prerequisites

Java JDK

Node.js and npm

Angular CLI

MySQL Server

IntelliJ IDEA

Git

1. Clone the repository

git clone https://github.com/GudipudiSwathi/Development-of-Smart-Procurement-Purchase-Order-Management-System.git
cd EnterpriseProcurementSystem

2. Create the MySQL database

CREATE DATABASE enterprise_procurement_system;

3. Configure database credentials securely

Use environment variables instead of committing real credentials to
GitHub:

DB_USERNAME=root
DB_PASSWORD=your_mysql_password

In IntelliJ:

Run → Edit Configurations → Environment variables

Do not commit database passwords, email passwords, API keys, or other
secrets.

4. Run the Spring Boot backend

Run:

EnterpriseProcurementSystemApplication

Backend:

http://localhost:8080

5. Run the Angular frontend

From the frontend directory:

npm install
ng serve

Frontend:

http://localhost:4200

🔐 Security

The application uses:

Spring Security

JWT-based authentication

BCrypt password hashing

Role-based access control

Environment-based configuration for sensitive credentials

📊 Project Presentation

The project presentation can be stored in:

documentation/
└── Enterprise-Procurement-System-Presentation.pptx

It covers the functional modules, workflow, architecture, payment
management, delivery tracking, dashboards, reports, and feedback.

🎯 Project Objectives

Digitize the procurement request process

Reduce manual procurement activities

Improve approval and purchase-order visibility

Centralize product and supplier information

Provide secure payment processing

Track supplier fulfilment and delivery

Improve procurement transparency through dashboards and reports

Provide a structured platform for feedback

👥 User Roles

Role                                Main Responsibilities

Employee                            Create requests, track procurement
activity, and provide feedback

Admin                               Manage users, products, suppliers,
requests, approvals, payments, and
procurement operations

📌 Project Information

Project: Development of Smart Procurement & Purchase Order
Management System
Type: Full-Stack Web Application
Program: B.Tech -- Computer Science and Engineering
Group: Group 2
Internship: Infosys SpringBoard Virtual Internship 7.0 Program

👤 Author

Gudipudi Durga Swathi
B.Tech -- Computer Science and Engineering

📄 License

This project was developed for educational and internship project
purposes.