# Smart QR-Based Student Portal — NWebSolution

Ek complete MERN stack system jaisa Saylani mein hota hai: QR code se attendance,
student portal, admin dashboard, aur AI-based attendance insights (drop-out risk detection).

## Features

- QR-based attendance (camera se scan karke instant mark)
- Har student ko auto-generated unique QR code
- Admin dashboard: students, courses, daily reports
- Student portal: apna QR code, apni attendance history
- AI Insights: pichle 14 din ki attendance dekh kar automatically batata hai
  kaunse students ki attendance kam ho rahi hai (drop-out risk)
- Late/Present status automatic time ke hisaab se
- JWT authentication, role-based access (admin/teacher vs student)

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios, html5-qrcode
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt password hashing

---

## Setup Instructions

### 1. Prerequisites
- Node.js (v18 ya usse upar) installed hona chahiye
- MongoDB installed locally, YA MongoDB Atlas (free cloud) ka account

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Ab `.env` file open karein aur apni values daalein:
- `MONGO_URI` — apna MongoDB connection string
- `JWT_SECRET` — koi bhi lamba random string
- `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD` — pehli baar login karne ke liye

Server start karein:
```bash
npm run dev
```

Yeh `http://localhost:5000` par chalega. Pehli baar chalne par ek default admin
account bhi automatically create ho jayega (console mein credentials print hongi).

### 3. Frontend Setup

Naye terminal mein:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Yeh `http://localhost:5173` par khulega.

### 4. First Login

Browser mein `http://localhost:5173/login` kholein, "Admin/Teacher" tab select
karein, aur `.env` mein diye gaye `DEFAULT_ADMIN_EMAIL`/`DEFAULT_ADMIN_PASSWORD`
se login karein.

---

## Workflow (Kaise Use Karein)

1. **Courses add karein** (Courses tab) — jaise "Web Development", "Graphic Design"
2. **Students add karein** (Students tab) — har student ke liye QR code auto-generate hoga
3. Student apne QR code se **login karke portal mein bhi dekh sakta hai** apna QR aur history
4. Har din **QR Scanner tab** khol kar students ke QR scan karein — attendance mark ho jayegi
5. **Reports tab** mein kisi bhi din ki attendance dekhein
6. **AI Insights tab** hafte mein ek baar check karein — system khud bata dega
   kaunse students ki attendance girti ja rahi hai

---

## Project Structure

```
smart-qr-portal/
├── backend/
│   ├── config/db.js          → MongoDB connection
│   ├── models/                → Student, Admin, Course, Attendance schemas
│   ├── routes/                → auth, students, attendance, courses APIs
│   ├── middleware/auth.js     → JWT protect + role checks
│   └── server.js              → main entry point
└── frontend/
    └── src/
        ├── pages/              → Login, Dashboard, Students, Scanner, Reports, Insights, Courses, StudentPortal
        ├── components/         → AdminLayout, ProtectedRoute
        ├── context/            → AuthContext (login state)
        └── api/axios.js        → API client with JWT auto-attach
```

---

## Next Steps / Ideas to Extend Further

- WhatsApp/SMS notification jab attendance mark ho (Twilio integration)
- Face verification add karke proxy attendance rokna (face-api.js)
- AI chatbot add karna jo student ke sawalon ka jawab de (OpenAI/Claude API)
- Fee payment tracking + automated reminders
- Parent portal (SMS/email se progress reports)

Yeh sab is base ke upar easily add ho sakte hain — architecture already flexible hai.

---

## Important Security Note

Deploy karne se pehle:
1. `.env` mein `JWT_SECRET` ko strong random string se replace karein
2. `DEFAULT_ADMIN_PASSWORD` login ke baad turant change karein
3. Production mein HTTPS use karein
4. MongoDB Atlas use kar rahe hain to IP whitelist set karein