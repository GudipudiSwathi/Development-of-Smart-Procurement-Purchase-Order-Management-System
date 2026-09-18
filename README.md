🚀 Development of Smart Procurement & Purchase Order Management System

A full-stack web-based Enterprise Procurement System that digitizes the procurement lifecycle from purchase request creation and approval to payment, supplier fulfilment, delivery tracking, reporting, and feedback.

📌 Project Overview

The Enterprise Procurement System provides a centralized platform for managing procurement activities across three main user roles.

👤 Employee

<ul>
<li>Create and submit purchase requests</li>
<li>Track request and order status</li>
<li>View procurement activity</li>
<li>Provide product reviews and feedback</li>
</ul>

🛡️ Admin

<ul>
<li>Manage employees and suppliers</li>
<li>Manage departments, categories, and products</li>
<li>Review, approve, or reject purchase requests</li>
<li>Manage purchase orders and payments</li>
<li>Monitor procurement activities through dashboards and reports</li>
</ul>

🏢 Supplier

<ul>
<li>Manage supplier profile and products</li>
<li>View approved and paid orders</li>
<li>Confirm and process orders</li>
<li>Update packing, shipping, and delivery status</li>
</ul>

✨ Key Features

<table>
<tr>
<td>🔐 <strong>Role-Based Access</strong><br>Secure login for Employee, Admin, and Supplier</td>
<td>📝 <strong>Purchase Requests</strong><br>Create and track procurement requests</td>
</tr>
<tr>
<td>✅ <strong>Admin Approval</strong><br>Review, approve, or reject requests</td>
<td>📦 <strong>Product & Supplier Management</strong><br>Manage products, categories, departments, and suppliers</td>
</tr>
<tr>
<td>📄 <strong>Purchase Orders</strong><br>Manage purchase order processing</td>
<td>💳 <strong>Payment Management</strong><br>Process payments and track transactions</td>
</tr>
<tr>
<td>🔢 <strong>MPIN Verification</strong><br>Verify MPIN for applicable payment flows</td>
<td>🚚 <strong>Delivery Tracking</strong><br>Track orders through fulfilment and delivery</td>
</tr>
<tr>
<td>⭐ <strong>Reviews & Feedback</strong><br>Submit product reviews and feedback</td>
<td>📊 <strong>Dashboards & Reports</strong><br>View procurement activities and summaries</td>
</tr>
</table>

🧩 Functional Modules

<table>
<thead>
<tr>
<th align="center">#</th>
<th>Module</th>
<th>Main Functions</th>
</tr>
</thead>
<tbody>
<tr>
<td align="center">01</td>
<td><strong>👤 User & Access Management</strong></td>
<td>Authentication, role-based access, employee/admin/supplier management, role-specific dashboards</td>
</tr>
<tr>
<td align="center">02</td>
<td><strong>🛒 Procurement Management</strong></td>
<td>Purchase requests, request review, approval/rejection, purchase orders, status tracking</td>
</tr>
<tr>
<td align="center">03</td>
<td><strong>📦 Product & Supplier Management</strong></td>
<td>Product catalog, categories, departments, suppliers, and supplier products</td>
</tr>
<tr>
<td align="center">04</td>
<td><strong>💳 Payment Management</strong></td>
<td>Payment initiation, payment methods, processing, MPIN verification, transaction tracking</td>
</tr>
<tr>
<td align="center">05</td>
<td><strong>🚚 Delivery & Order Tracking</strong></td>
<td>Order confirmation, packing, shipping, delivery completion, and tracking</td>
</tr>
<tr>
<td align="center">06</td>
<td><strong>📊 Dashboard, Reports & Feedback</strong></td>
<td>Dashboards, procurement summaries, reports, CSV/PDF/Excel exports, reviews, and feedback</td>
</tr>
</tbody>
</table>

🔄 End-to-End Procurement Workflow

<table>
<tr>
<td align="center"><strong>01</strong><br>👤<br><strong>Employee Login</strong></td>
<td align="center">→</td>
<td align="center"><strong>02</strong><br>📝<br><strong>Create Request</strong></td>
<td align="center">→</td>
<td align="center"><strong>03</strong><br>🛡️<br><strong>Admin Review</strong></td>
<td align="center">→</td>
<td align="center"><strong>04</strong><br>✅<br><strong>Approve / Reject</strong></td>
</tr>
</table>

<p align="center">⬇️</p>

<table>
<tr>
<td align="center"><strong>05</strong><br>📄<br><strong>Purchase Order</strong></td>
<td align="center">→</td>
<td align="center"><strong>06</strong><br>💳<br><strong>Payment</strong></td>
<td align="center">→</td>
<td align="center"><strong>07</strong><br>🏢<br><strong>Supplier Fulfilment</strong></td>
<td align="center">→</td>
<td align="center"><strong>08</strong><br>📦<br><strong>Order Processing</strong></td>
</tr>
</table>

<p align="center">⬇️</p>

<table>
<tr>
<td align="center"><strong>09</strong><br>🚚<br><strong>Shipping</strong></td>
<td align="center">→</td>
<td align="center"><strong>10</strong><br>📍<br><strong>Delivery Tracking</strong></td>
<td align="center">→</td>
<td align="center"><strong>11</strong><br>⭐<br><strong>Feedback</strong></td>
<td align="center">→</td>
<td align="center"><strong>12</strong><br>📊<br><strong>Reports</strong></td>
</tr>
</table>

🏗️ System Architecture

<table>
<tr>
<td align="center" width="25%">

🎨 Frontend

Angular

HTML5 • CSS3 • TypeScript

</td>
<td align="center" width="5%">→</td>
<td align="center" width="25%">

⚙️ Backend

Spring Boot

REST APIs
Spring Security
JWT

</td>
<td align="center" width="5%">→</td>
<td align="center" width="20%">

🗄️ Persistence

JPA / Hibernate

Data Access Layer

</td>
<td align="center" width="5%">→</td>
<td align="center" width="15%">

🛢️ Database

MySQL

Procurement Data

</td>
</tr>
</table>

<p align="center">

Angular Frontend → REST API → Spring Boot → JPA / Hibernate → MySQL

</p>

📁 Project Structure

<pre>
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
│   └── src/
│
├── pom.xml
└── README.md
</pre>
🛠️ Technology Stack

<table>
<tr>
<td width="50%">

🎨 Frontend

Angular

TypeScript

HTML5

CSS3

⚙️ Backend

Java

Spring Boot

REST APIs

Spring Security

JWT Authentication

</td>
<td width="50%">

🗄️ Database & Persistence

MySQL

Spring Data JPA

Hibernate

🔧 Development & Tools

IntelliJ IDEA

Visual Studio Code

Maven

Git

GitHub

Postman

</td>
</tr>
</table>

⚙️ Local Setup

📋 Prerequisites

<ul>
<li>Java JDK</li>
<li>Node.js and npm</li>
<li>Angular CLI</li>
<li>MySQL Server</li>
<li>IntelliJ IDEA</li>
<li>Git</li>
</ul>

1️⃣ Clone the Repository

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd EnterpriseProcurementSystem

2️⃣ Create the Database

CREATE DATABASE enterprise_procurement_system;

3️⃣ Configure Database Credentials

Use environment variables for local credentials:

DB_USERNAME=root
DB_PASSWORD=your_mysql_password

In IntelliJ IDEA:

Run → Edit Configurations → Environment variables

⚠️ Never commit real database passwords, email passwords, API keys, JWT secrets, or other sensitive credentials to GitHub.

4️⃣ Run the Spring Boot Backend

Run:

EnterpriseProcurementSystemApplication

Backend:

http://localhost:8080

5️⃣ Run the Angular Frontend

From the frontend directory:

npm install
ng serve

Frontend:

http://localhost:4200

🔐 Security

<ul>
<li>Spring Security</li>
<li>JWT-based authentication</li>
<li>BCrypt password hashing</li>
<li>Role-based access control</li>
<li>Environment-based configuration for sensitive credentials</li>
</ul>

📊 Project Presentation

The project presentation can be stored in the repository as:

documentation/
└── Enterprise-Procurement-System-Presentation.pptx

The presentation covers:

<ul>
<li>Project overview and objectives</li>
<li>Requirements and functional modules</li>
<li>Procurement workflow</li>
<li>System architecture</li>
<li>Payment management</li>
<li>Supplier processing</li>
<li>Delivery and order tracking</li>
<li>Dashboards and reports</li>
<li>Reviews and feedback</li>
</ul>

🎯 Project Objectives

<table>
<tr>
<td>🎯 Digitize procurement requests</td>
<td>⚡ Reduce manual procurement activities</td>
</tr>
<tr>
<td>📋 Improve approval visibility</td>
<td>📄 Streamline purchase-order processing</td>
</tr>
<tr>
<td>🤝 Centralize supplier information</td>
<td>💳 Provide secure payment processing</td>
</tr>
<tr>
<td>🚚 Track supplier fulfilment and delivery</td>
<td>📊 Improve procurement transparency</td>
</tr>
</table>

👥 User Roles

<table>
<thead>
<tr>
<th>Role</th>
<th>Responsibilities</th>
</tr>
</thead>
<tbody>
<tr>
<td>👤 <strong>Employee</strong></td>
<td>Create purchase requests, track procurement activity, and provide feedback</td>
</tr>
<tr>
<td>🛡️ <strong>Admin</strong></td>
<td>Manage users, products, suppliers, requests, approvals, payments, and procurement operations</td>
</tr>
<tr>
<td>🏢 <strong>Supplier</strong></td>
<td>Manage supplier products and process approved/paid orders through delivery</td>
</tr>
</tbody>
</table>

📌 Project Information

<table>
<tr>
<td><strong>📌 Project</strong></td>
<td>Development of Smart Procurement & Purchase Order Management System</td>
</tr>
<tr>
<td><strong>💻 Type</strong></td>
<td>Full-Stack Web Application</td>
</tr>
<tr>
<td><strong>🎓 Program</strong></td>
<td>B.Tech – Computer Science and Engineering</td>
</tr>
<tr>
<td><strong>👥 Group</strong></td>
<td>Group 2</td>
</tr>
<tr>
<td><strong>🏫 Internship</strong></td>
<td>Infosys SpringBoard Virtual Internship Program</td>
</tr>
</table>

👤 Author

<p align="center">

Gudipudi Durga Swathi

B.Tech – Computer Science and Engineering

</p>

<p align="center">
<strong>🚀 Smart Procurement • Better Process • Greater Transparency</strong>
</p>

<p align="center">
⭐ Developed as an educational and internship project.
</p>