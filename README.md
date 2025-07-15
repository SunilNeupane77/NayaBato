# Nayabato

## Empowering Communities Through Civic Engagement

Nayabato is a modern, full-stack web application designed to facilitate civic engagement by providing a platform for citizens to report and track local issues. It aims to foster transparency and accountability between community members and local authorities or relevant departments.

## Problem Statement

Many communities face challenges in effectively reporting and resolving local issues such as potholes, broken streetlights, illegal dumping, or public safety concerns. Existing reporting mechanisms can be cumbersome, lack transparency, and often leave citizens unaware of the status of their reported issues. This leads to frustration, disengagement, and prolonged unresolved problems.

Nayabato addresses these issues by:
*   Providing an intuitive and accessible platform for reporting.
*   Ensuring transparency in the issue resolution process.
*   Enabling communication and updates between reporters and administrators.
*   Offering an administrative interface for efficient management and tracking of issues.

## Features

*   **User Authentication:** Secure registration and sign-in for users.
*   **Issue Reporting:**
    *   Detailed issue submission forms.
    *   Location picking via interactive maps.
    *   Image upload capabilities (via Cloudinary).
*   **Issue Tracking & Management:**
    *   View active and resolved issues.
    *   Detailed issue pages with status updates.
    *   Commenting system for discussion and additional information.
*   **Notifications:** Real-time updates on issue status changes and new comments.
*   **User Profiles:** Personalized dashboards for managing reported issues and profile information.
*   **Admin Dashboard:**
    *   Comprehensive overview of system statistics.
    *   User management (view, edit, delete).
    *   Department management.
    *   Audit logs for tracking system activities.
*   **Email Notifications:** Automated emails for issue confirmation and status updates.
*   **Responsive Design:** Optimized for various devices (desktop, tablet, mobile).
*   **Legal Pages:** Dedicated Privacy Policy and Terms of Service pages.

## Tech Stack

Nayabato is built using a modern JavaScript ecosystem, leveraging the power of Next.js for a robust full-stack experience.

*   **Frontend:**
    *   **Next.js:** React framework for server-side rendering, static site generation, and API routes.
    *   **React:** JavaScript library for building user interfaces.
    *   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
    *   **Shadcn UI:** Reusable UI components built with Radix UI and Tailwind CSS.
*   **Backend:**
    *   **Next.js API Routes:** Serverless functions for handling API requests.
    *   **Node.js:** JavaScript runtime environment.
    *   **MongoDB:** NoSQL database for flexible data storage.
    *   **Mongoose:** MongoDB object data modeling (ODM) for Node.js.
*   **Authentication:**
    *   **NextAuth.js:** Flexible authentication for Next.js applications.
*   **Cloud Services:**
    *   **Cloudinary:** Cloud-based image and video management.
    *   **Nodemailer:** Module for sending emails from Node.js applications.
*   **Other Libraries:**
    *   `lucide-react`: Beautifully simple and customizable open-source icons.
    *   `react-query` (or `@tanstack/react-query`): For data fetching, caching, and synchronization.
    *   `bcryptjs`: For password hashing.

## Project Structure

The project follows a standard Next.js application structure with clear separation of concerns:

```
nayabato/
├── app/                      # Next.js App Router: Pages, layouts, and API routes
│   ├── api/                  # Backend API routes (e.g., /api/issues, /api/auth)
│   ├── auth/                 # Authentication-related pages (register, signin)
│   ├── issues/               # Issue-related pages (report, view, list)
│   ├── admin/                # Admin dashboard pages and layouts
│   ├── privacy-policy/       # Privacy Policy page
│   ├── terms-of-service/     # Terms of Service page
│   ├── favicon.ico           # Favicon
│   ├── globals.css           # Global CSS styles (Tailwind CSS imports)
│   ├── layout.js             # Root layout for the application
│   └── page.jsx              # Home page
├── components/               # Reusable React components
│   ├── comments/             # Components for comments (form, item, section)
│   ├── email/                # Email templates (for Nodemailer)
│   ├── forms/                # Reusable form components
│   ├── maps/                 # Map-related components (location picker, issue map)
│   ├── ui/                   # Shadcn UI components
│   ├── AuthProvider.jsx      # Context provider for authentication
│   ├── Footer.jsx            # Application footer
│   ├── Navigation.jsx        # Application navigation bar
│   └── QueryProvider.jsx     # Context provider for react-query
├── lib/                      # Utility functions, configurations, and database connections
│   ├── auth/                 # Authentication utilities
│   ├── cloudinary/           # Cloudinary configuration and utilities
│   ├── db/                   # Database connection and utilities (e.g., audit logs)
│   ├── email/                # Email sending utilities
│   ├── hooks/                # Custom React hooks (e.g., API hooks)
│   ├── config.js             # Application-wide configurations
│   └── utils.js              # General utility functions
├── models/                   # Mongoose schemas for MongoDB collections
│   ├── Audit.js
│   ├── Comment.js
│   ├── Department.js
│   ├── Issue.js
│   ├── Notification.js
│   └── User.js
├── public/                   # Static assets (images, fonts)
├── .vscode/                  # VS Code specific configurations (launch, tasks)
├── next.config.mjs           # Next.js configuration
├── package.json              # Project dependencies and scripts
├── postcss.config.mjs        # PostCSS configuration (for Tailwind CSS)
├── tailwind.config.js        # Tailwind CSS configuration
└── ...                       # Other configuration files (.gitignore, eslint, etc.)
```

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or Yarn
*   MongoDB instance (local or cloud-hosted)
*   Cloudinary account (for image uploads)
*   Email service provider (e.g., Gmail, SendGrid) for sending emails

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/nayabato.git
    cd nayabato
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root of the project and add the following environment variables:

    ```env
    # MongoDB Connection
    MONGODB_URI=your_mongodb_connection_string

    # NextAuth.js
    NEXTAUTH_SECRET=your_nextauth_secret_string # Generate a strong random string
    NEXTAUTH_URL=http://localhost:3000

    # Cloudinary
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret

    # Email Service (Example for Gmail)
    EMAIL_SERVER_HOST=smtp.gmail.com
    EMAIL_SERVER_PORT=587
    EMAIL_SERVER_USER=your_email@gmail.com
    EMAIL_SERVER_PASSWORD=your_email_app_password # Use app password for Gmail
    EMAIL_FROM=your_email@gmail.com
    ```
    *   You can generate a strong `NEXTAUTH_SECRET` using `openssl rand -base64 32`.
    *   For Gmail, you'll need to generate an App Password if you have 2-Step Verification enabled.

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Contributing

We welcome contributions to Nayabato! If you'd like to contribute, please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b bugfix/issue-description
    ```
3.  **Make your changes** and ensure they adhere to the project's coding style.
4.  **Write clear, concise commit messages.**
5.  **Push your branch** to your forked repository.
6.  **Open a Pull Request** to the `main` branch of the original repository, describing your changes in detail.

Please ensure your code passes linting and tests (if any are implemented).

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.