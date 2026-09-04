# A2R Demo Management System

A full-fledged Blood Bank Management System built with Next.js (App Router), Express.js, and MongoDB.

## Tech Stack

### Frontend
- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for charts and analytics
- **React Hook Form** for form handling
- **Axios** for API calls
- **React Hot Toast** for notifications

### Backend
- **Express.js** with Node.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for file uploads
- **Nodemailer** for email notifications
- **PDFKit** for certificate generation
- **Swagger** for API documentation

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Donor, Hospital)
- Password hashing with bcrypt

### Donor Module
- Donor registration with blood group
- 90-day eligibility rule enforcement
- Donation history tracking
- PDF donation certificates

### Blood Request Module
- Create blood requests with urgency levels
- Auto-match donors by blood group and city
- Email notifications for urgent/critical requests
- Prescription upload via Cloudinary

### Blood Inventory Module
- Track blood units by group and component
- Auto-calculated expiry dates
- Low stock alerts (threshold: 5 units)
- Expiring soon warnings

### Admin Dashboard
- Comprehensive analytics
- Blood stock overview (donut chart)
- Donation trend tracking (bar chart)
- User management (activate/deactivate/delete)
- CSV report exports (donors, requests, inventory)
- Hospital verification

### Hospital Module
- Hospital profile management
- Bulk blood request submission
- Request tracking with stats
- Blood availability checking

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bloodbank
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@bloodbank.com
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Seed the database with demo data:
```bash
npm run seed
```

Start the server:
```bash
npm run dev
```

### Frontend Setup

```bash
# From root directory
npm install
npm run dev
```

### Demo Credentials (after seeding)

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@bloodbank.com    | admin123    |
| Donor    | rahul@example.com      | donor123    |
| Hospital | city@hospital.com      | hospital123 |

## API Documentation

Once the backend is running, visit: `http://localhost:5000/api-docs`

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard pages
│   ├── auth/               # Login & Register
│   ├── dashboard/          # Donor dashboard pages
│   └── hospital/           # Hospital dashboard pages
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── layout/             # Layout components
│   └── charts/             # Chart components
├── context/                # React contexts (Auth)
├── lib/                    # API client & utilities
├── types/                  # TypeScript type definitions
└── server/                 # Express.js backend
    ├── config/             # Database & Cloudinary config
    ├── controllers/        # Route handlers
    ├── middleware/          # Auth, error handling, validation
    ├── models/             # Mongoose schemas
    ├── routes/             # API routes
    ├── scripts/            # Seed scripts
    ├── tests/              # Jest test files
    └── utils/              # Email, PDF, CSV utilities
```

## Testing

```bash
cd server
npm test
```

## Deployment

### Backend
Deploy the `server/` directory to any Node.js hosting (Railway, Render, Fly.io):
- Set all environment variables
- Ensure MongoDB Atlas URI for production

### Frontend
Deploy the root directory to Vercel:
- Set `NEXT_PUBLIC_API_URL` to your backend URL
- Framework: Next.js

## License

MIT
