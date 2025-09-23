# 🏙️ NayaBato

**Empowering Communities Through Civic Engagement**

A modern full-stack web application that bridges the gap between citizens and local authorities, providing a streamlined platform for reporting, tracking, and resolving community issues.

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/SunilNeupane77/NayaBato.git
cd NayaBato

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS, Framer Motion |
| **Backend** | Next.js API Routes, MongoDB, Mongoose |
| **Authentication** | NextAuth.js |
| **UI Components** | Radix UI, Shadcn/ui |
| **Maps** | React Leaflet |
| **Email** | Nodemailer |
| **Media** | Cloudinary |
| **Charts** | Recharts |

## ✨ Key Features

### For Citizens
- **Issue Reporting**: Submit detailed reports with photos and location
- **Real-time Tracking**: Monitor issue status and progress
- **Interactive Maps**: Visual location selection and issue browsing
- **Notifications**: Email updates and in-app notifications

### For Administrators
- **Dashboard Analytics**: Comprehensive issue statistics and trends
- **User Management**: Manage citizens and department officials
- **Department System**: Organize issues by responsible departments
- **Audit Logs**: Track all system activities

### Communication
- **Email System**: Automated notifications and weekly digests
- **Comment System**: Two-way communication on issues
- **Status Updates**: Real-time progress tracking

## 📁 Project Structure

```
nayabato/
├── app/                    # Next.js App Router
│   ├── api/               # Backend API endpoints
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── citizen/           # Citizen features
│   ├── issues/            # Issue management
│   └── profile/           # User profiles
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── forms/            # Form components
│   ├── maps/             # Map components
│   └── dashboard/        # Dashboard components
├── lib/                  # Utilities and services
├── models/               # MongoDB schemas
└── public/               # Static assets
```

## 🔧 Environment Setup

Create `.env.local` with:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or use the provided script
./docker-build-run.sh
```

## 📊 Database Models

- **User**: Citizens, admins, and officials
- **Issue**: Community problem reports
- **Comment**: Issue discussions
- **Department**: Government departments
- **Ward**: Administrative divisions
- **Notification**: System notifications
- **Audit**: Activity logging

## 🔐 Authentication & Authorization

- **Role-based access**: Citizen, Admin, Official
- **Session management**: Secure JWT tokens
- **Password security**: bcrypt hashing
- **OTP verification**: Email-based verification

## 📱 Responsive Design

- Mobile-first approach
- Optimized for all screen sizes
- Progressive Web App features
- Accessible UI components

## 🚀 Performance Features

- **Server-side rendering** with Next.js
- **Image optimization** with Cloudinary
- **Caching strategies** for better performance
- **Code splitting** and lazy loading

## 📈 Analytics & Monitoring

- Issue resolution metrics
- User activity tracking
- Department performance analytics
- System health monitoring

## 🔄 Development Workflow

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Version**: 2.1.0 | **Node.js**: v22.16.0 | **Next.js**: v15.3.5
