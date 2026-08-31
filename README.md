# 🚀 FreelanceHub — Full-Stack Freelance Marketplace

A production-ready freelance marketplace built with **React + Node.js + MongoDB**, featuring role-based authentication, real-time chat, payment integration, and a full admin panel.

---

## ✨ Feature Overview

| Feature | Status |
|---|---|
| JWT Auth + bcrypt | ✅ |
| Role-based access (Client / Freelancer / Admin) | ✅ |
| Job posting, editing, deletion | ✅ |
| Freelancer profiles + portfolio | ✅ |
| Apply to jobs with proposals | ✅ |
| Accept/reject applications → auto-create project | ✅ |
| Project workflow (submit → approve/revision) | ✅ |
| Reviews & ratings system | ✅ |
| Stripe payment intent / Razorpay order | ✅ |
| Escrow payment tracking | ✅ |
| Real-time chat (Socket.IO) | ✅ |
| Admin dashboard (users, jobs, revenue) | ✅ |
| Responsive dark-mode UI | ✅ |

---

## 🏗️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Axios, Socket.IO client

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Socket.IO

**Payments:** Stripe, Razorpay

**Deployment:** Vercel (frontend) + Render (backend) + MongoDB Atlas (database)

---

## 📁 Project Structure

```
freelance-marketplace/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── common/         # Reusable UI components
│       │   ├── job/            # Job-related components
│       │   ├── freelancer/     # Freelancer components
│       │   └── layout/         # Navbar, Footer
│       ├── context/            # AuthContext (global state)
│       ├── pages/
│       │   ├── auth/           # Login, Register
│       │   ├── public/         # Home, Jobs, Freelancers
│       │   ├── client/         # Post Job, Manage Jobs, Projects
│       │   ├── freelancer/     # Applications, Projects, Profile
│       │   ├── shared/         # Dashboard, Payments, Messages, Project Detail
│       │   └── admin/          # Dashboard, Users, Jobs, Reports
│       └── services/
│           └── api.js          # All Axios API calls
│
└── server/                     # Express backend
    ├── controllers/            # Business logic
    ├── models/                 # Mongoose schemas
    ├── routes/                 # API route definitions
    ├── middleware/             # Auth middleware (JWT + role-based)
    ├── seed.js                 # Database seeder
    └── index.js                # Server entry point + Socket.IO
```

---

## 🚦 Quick Start (Local Development)

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally **or** a MongoDB Atlas URI
- (Optional) Stripe and Razorpay test keys

### 1. Clone & Install

```bash
git clone <repo-url>
cd freelance-marketplace

# Install all dependencies
npm run install:all
# Or manually:
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Variables

**Server** — copy `.env.example` to `.env`:
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/freelance_marketplace
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

# Optional — Stripe payments
STRIPE_SECRET_KEY=sk_test_...

# Optional — Razorpay payments
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

CLIENT_URL=http://localhost:5173
```

**Client** — copy `.env.example` to `.env`:
```bash
cp client/.env.example client/.env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Seed the Database

```bash
cd server
node seed.js
```

This creates demo accounts:
| Email | Password | Role |
|---|---|---|
| admin@demo.com | password123 | Admin |
| client@demo.com | password123 | Client |
| client2@demo.com | password123 | Client |
| freelancer@demo.com | password123 | Freelancer |
| freelancer2@demo.com | password123 | Freelancer |
| freelancer3@demo.com | password123 | Freelancer |

### 4. Start the App

```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run dev:server   # Backend on http://localhost:5000
npm run dev:client   # Frontend on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login and get JWT |
| GET | `/api/auth/me` | Protected | Get current user |

### Jobs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/jobs` | Public | List jobs (with filters) |
| GET | `/api/jobs/:id` | Public | Get single job |
| POST | `/api/jobs` | Client | Create job |
| PUT | `/api/jobs/:id` | Client | Update job |
| DELETE | `/api/jobs/:id` | Client | Delete job |
| GET | `/api/jobs/client/my-jobs` | Client | Get my jobs |

### Applications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/applications` | Freelancer | Submit proposal |
| GET | `/api/applications/my` | Freelancer | My applications |
| GET | `/api/applications/job/:jobId` | Client | Job's applications |
| PUT | `/api/applications/:id/status` | Client | Accept/reject |

### Projects
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/projects/my` | Protected | Get my projects |
| GET | `/api/projects/:id` | Protected | Project details |
| POST | `/api/projects/:id/submit` | Freelancer | Submit delivery |
| PUT | `/api/projects/:id/approve` | Client | Approve delivery |
| PUT | `/api/projects/:id/revision` | Client | Request revision |

### Payments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/payments/stripe/create-intent` | Client | Create Stripe intent |
| POST | `/api/payments/stripe/confirm` | Client | Confirm payment |
| POST | `/api/payments/razorpay/create-order` | Client | Create Razorpay order |
| GET | `/api/payments/my` | Protected | Payment history |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users/profile` | Protected | Get own profile |
| PUT | `/api/users/profile` | Protected | Update profile |
| GET | `/api/users/freelancers` | Public | Browse freelancers |
| GET | `/api/users/:id` | Public | Get user by ID |

### Reviews
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/reviews` | Protected | Submit review |
| GET | `/api/reviews/user/:userId` | Public | User's reviews |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin | Platform stats |
| GET | `/api/admin/users` | Admin | All users |
| PUT | `/api/admin/users/:id` | Admin | Update user |
| GET | `/api/admin/jobs` | Admin | All jobs |
| DELETE | `/api/admin/jobs/:id` | Admin | Delete job |
| GET | `/api/admin/payments` | Admin | All payments |

---

## 💳 Payment Integration

### Stripe
The app creates a PaymentIntent and puts funds in "escrow" (tracked in DB). On project approval, the payment status updates to "released".

**Flow:** Client pays → funds marked as escrow → project completed → funds released to freelancer (you can wire this to Stripe Connect for real payouts).

### Razorpay
For INR payments, the app creates a Razorpay order. Verify the payment signature on success.

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy the dist/ folder to Vercel
# Set environment variable: VITE_API_URL=https://your-backend.onrender.com/api
```

### Backend → Render
1. Create a new Web Service on [render.com](https://render.com)
2. Point to the `server/` directory
3. Build command: `npm install`
4. Start command: `node index.js`
5. Add all environment variables from `.env`

### Database → MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist `0.0.0.0/0` for Render's dynamic IPs
4. Copy the connection string to `MONGODB_URI`

---

## 🧩 Database Models

| Model | Key Fields |
|---|---|
| **User** | name, email, password, role, skills, hourlyRate, rating |
| **Job** | title, description, budget, deadline, clientId, status |
| **Application** | jobId, freelancerId, proposal, bidAmount, status |
| **Project** | jobId, freelancerId, clientId, status, deliveries |
| **Review** | projectId, reviewerId, revieweeId, rating, comment |
| **Payment** | projectId, amount, status, gateway, platformFee |
| **Message** | conversationId, senderId, recipientId, content |

---

## 🔮 Optional Advanced Features (Not Included — Extension Points)

- **Escrow via Stripe Connect** — Use `stripe.transfers.create()` to pay freelancers directly
- **File uploads** — Use Cloudinary or AWS S3 + multer for portfolio/delivery attachments
- **Email notifications** — Add nodemailer for application updates, project milestones
- **AI job recommendations** — Use OpenAI embeddings to match freelancers to jobs
- **Milestone-based payments** — Project model already has `milestones[]` array ready

---

## 📝 License

MIT — free to use, modify, and deploy.
