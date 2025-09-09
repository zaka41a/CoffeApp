# ☕ CoffeApp

## 📖 Overview
CoffeApp is a full-stack web application designed to **manage café operations** efficiently.  
It provides separate dashboards for **admins** and **waiters**, handling tables, menus, and orders seamlessly.  

---

## ✨ Features
### 👨‍💼 Admin
- Manage menu items (CRUD: create, update, delete).
- Manage dining tables.
- Add, edit, and remove waiters.
- View daily and range-based sales reports.
- Track **remittances** (totals to be given by each waiter per day).

### 👨‍🍳 Waiter
- View available tables (cannot add/edit).
- Take customer orders with menu integration.
- Change table status (occupied/free).
- Mark orders as **paid** once customers complete payment.
- Daily summary with total amount to remit.

### 🌐 General
- Secure login system with roles (Admin / Waiter).
- Real-time order and table status updates.
- Responsive and user-friendly interface.
- Background coffee theme for login and home.

---

## 🛠️ Tech Stack
- **Frontend**: React + Vite  
- **Backend**: PHP (REST API)  
- **Database**: MySQL  
- **Server**: XAMPP (Apache + PHP + MySQL)  

---

## 🚀 Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/zaka41a/CoffeApp.git
   cd CoffeApp
