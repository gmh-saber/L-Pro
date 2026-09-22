# 🛒  Projoss — Complete Laravel E-Commerce & Marketplace Platform

A modern, blazing-fast, and high-converting Online Marketplace & E-Commerce platform built with **Laravel 11**, **Inertia.js**, **React**, and **Tailwind CSS**. Specially optimized for Bangladeshi D2C brands, multi-vendor marketplaces, and global online stores with built-in Courier integrations, Fraud Protection, 1-Click COD Checkout, and Abandoned Cart Recovery.

---

## 👨‍💻 Author & Developer Details

* **Created By:** **MD Sabuj**
* **Founder & Official Website:** [projoss.com](https://projoss.com)
* **Developer Portfolio:** [projoss.com/sabuj](https://projoss.com/sabuj)
* **Project Support:** [support@projoss.com](mailto:support@projoss.com)

---

## 🎥 Video Installation & Setup Tutorial

Watch the complete step-by-step video tutorial to install and configure the platform on localhost or cPanel / VPS hosting:

▶️ **[Click Here to Watch Video Tutorial on YouTube](https://youtu.be/tr6TX4G7bsA)**

---

## 📜 License & Resale Rights

> **✅ COMMERCIAL & RESALE LICENSE GRANTED**
> 
> You have full commercial rights to:
> - Use this source code for your own e-commerce business or client projects.
> - Modify, rebrand, customize, and extend all features.
> - **Resale Allowed:** You may package, resell, or distribute this script as part of your commercial solutions and agency offerings.

---

## ⚙️ Server & System Requirements

Before installing, ensure your local environment or hosting server meets the following requirements:

| Requirement | Supported / Recommended Version |
| :--- | :--- |
| **PHP Version** | **PHP 8.2 or PHP 8.3+** *(PHP 8.3 Recommended)* |
| **Database** | **MySQL 5.7+ / 8.0+** or **MariaDB 10.3+** |
| **Web Server** | Apache (mod_rewrite), Nginx, LiteSpeed, or cPanel |
| **Composer** | Composer 2.x |
| **Node.js** | Node.js v18+ or v20+ & NPM |
| **PHP Extensions** | `BCMath`, `Ctype`, `cURL`, `DOM`, `Fileinfo`, `Filter`, `GD` / `Imagick`, `JSON`, `Mbstring`, `OpenSSL`, `PCRE`, `PDO`, `pdo_mysql`, `Tokenizer`, `XML` |

---

## 🔑 Default Login Credentials

Access your Admin Dashboard immediately after database setup:

* **Admin Login URL:** `https://yourdomain.com/admin/login` (Local: `http://127.0.0.1:8000/admin/login`)

| User Role | Email Address | Password |
| :--- | :--- | :--- |
| **Super Admin / Store Owner** | `admin@projoss.com` *(or `admin@projoss.test`)* | `password` |
| **Demo Customer Account** | `customer@projoss.com` *(or `customer@projoss.test`)* | `password` |

*(You can change all admin credentials directly from Admin ➔ Profile / Settings).*

---

## 🚀 Step-by-Step Installation Guide

### Method 1: Local Development Setup (Quick Start)

1. **Clone or Extract Project:**
   ```bash
   cd shop
   ```

2. **Install PHP & Node Dependencies:**
   ```bash
   composer install
   npm install
   ```

3. **Configure Environment File:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Setup Database in `.env`:**
   Open `.env` and enter your database details:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=shopzy_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```

5. **Run Migrations & Seed Sample Data:**
   ```bash
   php artisan migrate --seed
   ```

6. **Create Public Storage Symlink:**
   ```bash
   php artisan storage:link
   ```

7. **Build Frontend Assets & Start Servers:**
   ```bash
   # In terminal 1 (Laravel backend):
   php artisan serve --port=8000

   # In terminal 2 (Vite frontend):
   npm run dev
   # Or for production build:
   npm run build
   ```
   Open `http://127.0.0.1:8000` in your browser!

---

### Method 2: cPanel & Shared Hosting Installation

1. **Upload Files:**
   - Zip the project files (excluding `node_modules` and `.git`).
   - Upload and extract inside your cPanel directory (e.g. `public_html` or a subfolder).
   - Set document root to point to the `public/` directory (or use standard `.htaccess` routing).
2. **Create MySQL Database & User:**
   - In cPanel, go to **MySQL Database Wizard**, create a database and user, and assign All Privileges.
3. **Configure `.env`:**
   - Edit `.env` with your domain URL (`APP_URL`), database name, DB user, and DB password.
   - Set `APP_ENV=production` and `APP_DEBUG=false`.
4. **Import Database:**
   - Run `php artisan migrate --seed` via cPanel Terminal, OR import the provided SQL file via phpMyAdmin.
5. **Storage Symlink:**
   - In cPanel Terminal, run `php artisan storage:link`.
6. **Compile Assets:**
   - Run `npm run build` locally and upload the generated `public/build` directory to your server.

---

## 💎 Powerful E-Commerce Features Included

* **⚡ 1-Click COD Quick Order Modal:** High-converting popup checkout on product pages with instant **➕ / ➖ Quantity Controls**, address auto-fill, and live order summary.
* **🚚 Free Home Delivery Toggle:** Set individual products to Free Shipping with ৳0 delivery charge and clean storefront badges.
* **📦 Automated Courier Integrations:**
  - **Steadfast Courier API** (Automatic parcel creation, numeric Consignment / Parcel ID tracking).
  - **Pathao Courier** & **RedX Logistics** support.
* **🛡️ Fake Order Guard (Fraud Protection):**
  - Instant IP blocking, device fingerprinting, and phone order limits.
  - Automatic **BD Courier Delivery Success Rate & Fraud Checker**.
* **🛒 Abandoned Checkouts CRM:**
  - 1-Click "Create Order & Mark as Recovered" feature.
  - Direct WhatsApp Recovery Message templates.
* **🎨 Storefront CTA & Button Customizer:** Customize button text, colors, icons, and behavior for COD, WhatsApp, Call, Add to Cart, and Buy Now buttons.
* **📝 Rich Text Product Description Editor:** Full WYSIWYG editor with Bold, Italic, Lists, Alignments, Headings, and HTML mode for both Short and Full descriptions.
* **📱 Mobile First Design:** Fully responsive layout with bottom sheets, smooth touch gestures, and iOS typing fix.
* **💳 Payment Gateways:** Cash on Delivery (COD) + Mobile Banking (bKash, Nagad, Rocket).
* **🧾 Printable Thermal Invoices:** 1-Click POS invoice and courier parcel slips with QR/barcode ready layout.

---

## 🤝 Support & Customization

If you need any custom features, payment gateway integrations, or specialized design setups:
- **Developer Website:** [projoss.com/sabuj](https://projoss.com/sabuj)
- **Company Website:** [projoss.com](https://projoss.com)
- **Email:** [support@projoss.com](mailto:support@projoss.com)

*Developed with ❤️ by **MD Sabuj** — Founder of [projoss.com](https://projoss.com)*
