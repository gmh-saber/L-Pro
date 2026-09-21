# Shopzy — cPanel Deployment Guide

## What's in this ZIP
- Full Laravel application (Shopzy marketplace)
- Pre-built production JS/CSS assets in `public/build/`
- All uploaded images in `public/uploads/`
- Full database dump at `database/shopzy_full.sql`
- Production `.env` template at `.env.production`

---

## Step 1 — Upload & Extract

1. Log in to **cPanel → File Manager**
2. Navigate to `public_html` (or your domain's root folder)
3. Click **Upload** and upload `shopzy-production.zip`
4. Right-click the ZIP → **Extract** → extract into `public_html/`

After extraction your structure should look like:
```
public_html/
├── .htaccess           ← root redirect (DO NOT DELETE)
├── .env.production     ← rename this to .env
├── app/
├── artisan
├── bootstrap/
├── config/
├── database/
├── public/             ← web root served by Apache
│   ├── .htaccess
│   ├── index.php
│   └── build/
├── resources/
├── routes/
├── storage/
└── vendor/
```

---

## Step 2 — Create Database

1. Go to **cPanel → MySQL Databases**
2. Create a new database (e.g. `youruser_shopzy`)
3. Create a database user with a strong password
4. Add the user to the database with **All Privileges**

---

## Step 3 — Import Database

1. Go to **cPanel → phpMyAdmin**
2. Click your new database on the left
3. Click **Import** tab
4. Choose file: `public_html/database/shopzy_full.sql`
5. Click **Go** — all 29 tables will be created with demo data

---

## Step 4 — Configure `.env`

1. In **File Manager**, rename `.env.production` → `.env`
2. Open `.env` and fill in all values marked `← EDIT`:

```env
APP_URL=https://yourdomain.com
APP_KEY=                       # see Step 5

DB_DATABASE=youruser_shopzy    # database name from Step 2
DB_USERNAME=youruser_dbuser    # database user from Step 2
DB_PASSWORD=your_password      # database password

SESSION_DOMAIN=.yourdomain.com

MAIL_HOST=mail.yourdomain.com
MAIL_USERNAME=no-reply@yourdomain.com
MAIL_PASSWORD=your_smtp_password
MAIL_FROM_ADDRESS=no-reply@yourdomain.com
```

---

## Step 5 — Generate App Key (SSH / Terminal)

> If your cPanel has **Terminal** (SSH), run these commands from `public_html/`:

```bash
php artisan key:generate
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

> **No SSH?** Use cPanel → **PHP Script Runner** or ask your host.
> You can also manually generate a key:
> ```bash
> # Run locally on your machine, then paste the output into .env as APP_KEY=
> php artisan key:generate --show
> ```

---

## Step 6 — Set File Permissions

In **File Manager**, set these permissions:
- `storage/` → **755** (recursively)
- `bootstrap/cache/` → **755**

Or via SSH:
```bash
chmod -R 755 storage bootstrap/cache
```

---

## Step 7 — Set Document Root (if needed)

If your host lets you choose the document root, set it to:
```
public_html/public
```

If you **cannot** change the document root, the root `.htaccess` file already redirects all traffic into `public/` automatically.

---

## Step 8 — Verify

Visit your domain. You should see the Shopzy storefront.

**Admin login:** Go to `https://yourdomain.com/admin`
- Email: `admin@projoss.test`  
- Password: `password`  
⚠️ **Change the admin password immediately after first login!**

---

## Troubleshooting

| Issue | Fix |
|---|---|
| White blank page | Check `APP_DEBUG=true` temporarily, see error |
| 500 error | Check `storage/logs/laravel.log` |
| Images not showing | Run `php artisan storage:link` |
| Can't log in | Clear sessions: `php artisan session:flush` or truncate `sessions` table |
| Assets 404 | Confirm `public/build/manifest.json` exists |
| Session issues | Check `SESSION_DOMAIN` matches your domain exactly |

---

## Security Checklist

- [ ] `APP_DEBUG=false` in `.env`
- [ ] `APP_KEY` is set and unique
- [ ] Admin password changed from default
- [ ] `SESSION_SECURE_COOKIE=true` (requires HTTPS)
- [ ] SSL certificate installed on domain
- [ ] `COURIER_WEBHOOK_SECRET` set if using courier APIs
