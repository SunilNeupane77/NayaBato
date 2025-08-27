# Changelog

All notable changes to the Nayabato project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-08-27

### 🚀 Major Features Added

#### Email System Migration
- **BREAKING**: Migrated from Resend to Nodemailer for email delivery
- **NEW**: Gmail SMTP integration with App Password authentication
- **NEW**: Comprehensive email template system using React Email components
- **NEW**: Seven email types: welcome, issue confirmation, status updates, password reset, comment notifications, assignment notifications, and weekly digest

#### Enhanced Toast Notification System
- **NEW**: Multiple toast variants (success, error, warning, info)
- **NEW**: Advanced animations including bounce-in effects and progress bars
- **NEW**: Improved positioning and visibility
- **NEW**: Enhanced styling with color-coded variants

### 🔧 Technical Improvements

#### Email Infrastructure
- Added robust Nodemailer service with comprehensive error handling
- Implemented React-based email templates for consistency
- Created extensive testing suite for email functionality
- Added email validation and sanitization

#### User Experience
- Enhanced toast notifications with better visual feedback
- Improved mobile responsiveness for notifications
- Added accessibility improvements for screen readers
- Optimized animations for better performance

#### Development Workflow
- Created comprehensive testing scripts for email functionality
- Added detailed documentation for setup and troubleshooting
- Simplified environment configuration
- Enhanced error logging and monitoring

### 📋 Configuration Changes

#### Environment Variables
- **REMOVED**: `RESEND_API_KEY`
- **ADDED**: Gmail-specific email configuration:
  - `EMAIL_USER` - Gmail address
  - `EMAIL_PASS` - Gmail App Password
  - `EMAIL_FROM` - From address for emails
  - `TEST_EMAIL` - Test recipient address
  - `REPLY_TO_EMAIL` - Reply-to address

#### Dependencies
- **REMOVED**: `resend` package
- **ENHANCED**: Utilizing existing `nodemailer` package
- **KEPT**: `@react-email/components` for email templates
- **ADDED**: Enhanced `framer-motion` usage for animations

### 📚 Documentation

#### New Files
- `RECENT_UPDATES.md` - Comprehensive overview of latest changes
- `EMAIL_CONFIG.md` - Detailed Gmail setup instructions
- `NODEMAILER_MIGRATION_COMPLETE.md` - Migration completion summary
- `CHANGELOG.md` - This changelog file

#### Updated Files
- `README.md` - Enhanced features section and documentation links
- `.env.example` - Updated with Nodemailer configuration
- Various API documentation updates

### 🧪 Testing

#### Email Testing
- `scripts/test-email-standalone.js` - Comprehensive email testing
- `scripts/test-all-emails.js` - Test all email types
- `scripts/test-nodemailer.js` - Next.js context testing
- API endpoint testing via `/api/email/test`

#### Quality Assurance
- Manual testing of toast notification system
- Visual regression testing for consistent styling
- Accessibility testing for screen reader compatibility
- Performance testing for animation smoothness

### 🐛 Bug Fixes
- Fixed broken logo references in email templates
- Improved error handling in email sending
- Enhanced toast notification positioning issues
- Resolved mobile responsiveness issues

### 🔒 Security
- Implemented secure Gmail App Password authentication
- Enhanced email validation and sanitization
- Improved error logging without exposing sensitive data
- Added rate limiting considerations for email sending

---

## [2.0.0] - Previous Release

### Features
- Initial civic issue reporting platform
- User authentication and authorization
- Issue tracking and management system
- Admin dashboard with comprehensive statistics
- Interactive maps for location-based issue reporting
- Comment system for community engagement
- Notification system for status updates
- Responsive design for all devices
- Legal pages (Privacy Policy, Terms of Service)

### Technical Stack
- Next.js with App Router
- React with modern hooks
- MongoDB with Mongoose ODM
- NextAuth.js for authentication
- Tailwind CSS for styling
- Shadcn UI components
- Cloudinary for image management
- Leaflet for interactive maps

---

## Version History

- **v2.1.0** (2025-08-27) - Email Migration & Toast Enhancements
- **v2.0.0** - Initial Production Release
- **v1.x.x** - Development and Beta Versions

---

## Migration Notes

### From v2.0.0 to v2.1.0

#### Required Actions
1. **Gmail Setup**: Configure Gmail App Password (see EMAIL_CONFIG.md)
2. **Environment Variables**: Update .env file with new email configuration
3. **Dependencies**: Run `npm install` to ensure all packages are up to date
4. **Testing**: Run email tests to verify functionality

#### Breaking Changes
- Resend API integration removed (replace with Gmail configuration)
- Email service initialization changed (automatic with new setup)
- Some email template props may have changed (check templates if customized)

#### Backward Compatibility
- All existing API endpoints remain functional
- Database schema unchanged
- User authentication system unchanged
- Issue reporting workflow unchanged

---

## Support

For questions about specific versions or migration assistance:
- Check the documentation files listed in README.md
- Review the RECENT_UPDATES.md for detailed change information
- Use the testing scripts provided for troubleshooting
- Refer to EMAIL_CONFIG.md for email setup issues

---

**Maintained by**: Nayabato Development Team  
**Last Updated**: August 27, 2025
