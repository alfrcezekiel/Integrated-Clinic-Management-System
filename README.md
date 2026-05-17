# Integrated-Clinic-Management-System

Integrated Clinic Management is a web-based application that helps end-users such clinical staff, and patients to manage clinic operations. This initiative helps communities to streamline the appointment scheduling in clinics to prevent over-queuing of patients and reduce the hassle of manual scheduling. Also, this web-based application helps minimize the traditional paper-based records in clinics to promote efficiency and data security.

The core features of this web-based application includes:

- Appointment Scheduling
- Role-based Access Control **(for clinical staff, and patients)**
- Electronic Health Records **(EHR)**
- Automated Notification & Reminders **via SMTP**
- Secure Authentication Portal
- Browse Registered Clinic **(for patients)**
- Auto-Generated Medical Report
- Filtered Appointment Management via **Status**
- Data Visualization real-time tracking for **(Clinical Staff side)**
- Appointment Calendar Visualization **(for both clinical staff and patient)**
- Appointment totals and statistics **(for Clinical Staff and Patients)**
- **Clinical Staff** can view patients' appointment history **(for Clinical Staff side)**

## Tech Stack Used

- Frontend: Vite 8.0.13 and React.js v19.2.6
- Backend: Node.js v24.15.0 and Express.js 5.2.1
- Database: MySQL 8.0.47
- Others: Bun: v1.3.14, npm 11.12.1 and Tailwind CSS 4.3.0

## Clone the repository

```
git clone https://github.com/alfrcezekiel/Integrated-Clinic-Management-System.git if you're using HTTPS

git clone git@github.com:alfrcezekiel/Integrated-Clinic-Management-System.git if you're using SSH
```

## Install dependencies in directory of `front-end`

```
cd front-end
npm install
npm run dev or bun dev
```

## Install dependencies in directory of `back-end`

```
cd back-end
npm install
npm run dev or bun run dev
```

## Getting Started

Running this web-based application must have installed Node.js **(20.16.0 or higher)** and bun **(1.5.14 or higher)**. If you haven't installed Node.js, you can download it from [nodejs.org](https://nodejs.org/). If you haven't installed bun, you can download it from [bun.sh](https://bun.sh/).

Prioritized using `npm command` for installing the needed packages instead of `bun`. `bun command` is used only for running the application.

### Runing the application in the root project

You can use the `bun command` to run the application in the root project by using `bun dev`. This will run both the front-end and back-end of the application.

```
bun dev
```

### Note:

**DO NOT commit or push `.env` or `.env.local` files to this repository.**

Environment variables may contain sensitive credentials such as:

- Secret Keys
- Token Configration
- SMTP Credentials
- Database Credentials
- URL Configration

Before pushing any changes to the repository, make sure you've initialize a `.gitignore` in project root directory or `front-end` and `back-end` sub-directory. This is to prevent the pushing of sensitive credentials to the repository.

### Setup back-end directory environment variables

```
APPOINTMENT_REMINDER_SCHEDULE=0 * * * *
FOLLOW_UP_MESSAGE_SCHEDULE=0 10 * * *

WSL_DISTRO_NAME=<YOUR_WSL_DISTRO_NAME>
WSL_DEFAULT_DISTRO=<YOUR_WSL_DEFAULT_DISTRO>
WSL_CURRENT_USER=<YOUR_WSL_CURRENT_USER>
USER=<YOUR_USER>

LOGNAME=<YOUR_LOGNAME>
USERNAME=<YOUR_USERNAME>

BACKUP_DIR=<YOUR_BACKUP_DIR>
NODE_ENV=<YOUR_NODE_ENV>
BACKUP_ENCRYPTION_KEY=<YOUR_BACKUP_ENCRYPTION_KEY>

DB_PASSWORD=<YOUR_DB_PASSWORD>
DB_HOST=<YOUR_DB_HOST>
DB_USER=<YOUR_DB_USER>
DB_PORT=<YOUR_DB_PORT>
DATABASE_NAME=<YOUR_DATABASE_NAME>

LOG_DIR=<YOUR_LOG_DIR>
LOG_LEVEL=info
LOG_LEVEL_LOG=log
LOG_LEVEL_ERROR=error
LOG_LEVEL_DEBUG=debug
LOG_LEVEL_WARN=warn

JWT_SECRET=<YOUR_JWT_SECRET>
REFRESH_KEY_SECRET=<YOUR_REFRESH_KEY_SECRET>

SESSION_SECRET=<YOUR_SESSION_SECRET>
FRONTEND_ENDPOINT=http://localhost:5173
RESEND_API_KEY=<YOUR_RESEND_API_KEY>

SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_EMAIL_USER=<YOUR_SMTP_EMAIL_USER>
SMTP_EMAIL_PASSWORD=<YOUR_SMTP_EMAIL_PASSWORD>

PORT=<YOUR_PORT>
BACKUP_SCHEDULE_DEV=0 */6 * * *
BACKUP_SCHEDULE_PROD=0 2 * * *
VITE_BASE_CLIENT_URL=http://localhost:5173/cms
CLIENT_VERCEL_DOMAIN=http://localhost:5173/cms

TWILIO_ACCOUNT_SID=<YOUR_TWILIO_ACCOUNT_SID>
TWILIO_AUTH_TOKEN=<YOUR_TWILIO_AUTH_TOKEN>
TWILIO_PHONE_NUMBER=<YOUR_TWILIO_PHONE_NUMBER>
```

### Setup front-end directory environment variables

```
VITE_ENV=<YOUR_VITE_ENV>
VITE_BASE_API_URL=<YOUR_VITE_BASE_API_URL>
```

## Sample Credentials of web-based application to login

### Credentials for Clinical Staff Side

_Dental Clinic Credentials_

```
Email address: renjosephclinic@gmail.com
Password: renjosephclinic
```

_Psychiatry Clinic Credentials_

```
Email address: noxclinic@gmail.com
Password: noxclinic
```

### Credentials for Patients Side

_Patient Account_

```
Email address: colet_vergara@gmail.com
Password: colet_vergara
```

### Credentials for Admin Side

_Admin Account_

```
Email address: superadmin_5@gmail.com
Password: superadmin_5
```

## Access the admin login portal

This is the url of admin portal to access its dashboard account

```
http://localhost:5173/admin-login
```
