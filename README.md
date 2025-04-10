# Career Navigator

## 1. System Overview
Career Navigator is a comprehensive web-based platform designed to facilitate career guidance by connecting students with professional counselors. The application follows a three-tier architecture with distinct panels for students, counselors, and administrators, and includes a robust payment system integrated with Stripe.

## 2. Technical Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite
- **ORM**: SQLAlchemy
- **Email Service**: Gmail SMTP
- **Task Scheduler**: APScheduler
- **Payment Processing**: 
  - Stripe (primary)
  - Razorpay (secondary)
- **Additional Libraries**: 
  - flask_cors (CORS handling)
  - flask_mail (Email functionality)
  - flask_migrate (Database migrations)

### Frontend
- HTML/CSS
- JavaScript
- Bootstrap
- Font Awesome
- Static assets (resources, images, JS, CSS)

## 3. Database Schema

### Core Tables
1. **students**
   - Basic profile information
   - Authentication details
   - Interest tracking

2. **counselors**
   - Professional profile
   - Verification status
   - Approval workflow

3. **counselor_schedules**
   - Availability management
   - Time slot tracking

4. **interest**
   - Career interests
   - Interest categories

5. **notifications**
   - System notifications
   - Scheduled messages

6. **resources**
   - Educational materials
   - File management
   - Download tracking

7. **feedbacks**
   - Student-counselor feedback
   - Rating system

8. **payments**
   - Payment records
   - Transaction tracking
   - Package information
   - Payment status

## 4. Key Features

### Student Panel (`/student/*`)
- Registration and authentication
- Interest-based profile creation
- Counselor discovery
- Appointment scheduling
- Resource access
- Feedback submission
- Subscription plan selection
- Secure payment processing

### Counselor Panel (`/counselor/*`)
- Professional profile management
- Schedule management
- Resource upload/management
- Student interaction
- Feedback analytics
- Verification system

### Admin Panel (`/admin/*`)
- User management
- Counselor approval workflow
- Interest category management
- Resource monitoring
- System notifications
- Analytics dashboard
- Payment monitoring

### Payment System
- Tiered subscription plans (Basic, Premium, Ultimate)
- Secure checkout via Stripe
- Payment success/failure handling
- Transaction recording
- Email confirmation
- Webhook integration for asynchronous events

## 5. Core Workflows

### Authentication Flow
1. User registration (student/counselor)
2. Email verification (counselors)
3. Login with credentials
4. Session management

### Payment Flow
1. User selects subscription package
2. Redirected to Stripe payment gateway
3. Processes payment
4. Success/failure handling
5. Confirmation via email
6. Transaction recording in database

### Appointment Scheduling
1. Student selects counselor
2. Views available time slots
3. Books appointment
4. Notification system triggers

### Resource Management
1. Counselors upload resources
2. Admin approval (if required)
3. Student access
4. Download tracking

## 6. Directory Structure
career-navigator/
├── instance/
│ └── careernavigator.db
├── static/
│ ├── resources/
│ ├── img/
│ │ └── coun_uploads/
│ ├── js/
│ └── css/
│ └── landing_page/
├── templates/
│ ├── landing_page/
│ │ ├── about.html
│ │ ├── contact.html
│ │ ├── counselor.html
│ │ ├── faq.html
│ │ ├── header.html
│ │ ├── landing_page.html
│ │ ├── meeting-card.html
│ │ ├── meeting-join.html
│ │ ├── meeting.html
│ │ ├── services.html
│ │ └── student.html
│ ├── counselor/
│ │ ├── coun_appointment.html
│ │ ├── coun_feedback.html
│ │ ├── coun_login.html
│ │ ├── coun_profile.html
│ │ ├── coun_regi.html
│ │ ├── coun_resources.html
│ │ ├── counselor_dash.html
│ │ └── view_stud.html
│ ├── admin/
│ │ ├── add_interest.html
│ │ ├── admins.html
│ │ ├── appointments.html
│ │ ├── dashboard.html
│ │ ├── edit_stud.html
│ │ ├── interests.html
│ │ ├── logout.html
│ │ ├── manage_counselor.html
│ │ ├── manage_stud.html
│ │ ├── monitor_resource.html
│ │ ├── notifications.html
│ │ └── reports.html
│ └── student/
│ ├── appointments.html
│ ├── feedback.html
│ ├── find_counselors.html
│ ├── login.html
│ ├── payment.html
│ ├── payment_failed.html
│ ├── payment_success.html
│ ├── register.html
│ ├── resources.html
│ ├── schedule.html
│ ├── settings.html
│ └── stud-dash.html
├── app.py
├── config.py
├── init_db.py
├── model.py
└── test_smtp.py

## 7. Configuration

### Environment Variables
- `SECRET_KEY`: Application security key
- `MAIL_USERNAME`: SMTP email username
- `MAIL_PASSWORD`: SMTP email password
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- `RAZORPAY_KEY_ID`: Razorpay key ID
- `RAZORPAY_KEY_SECRET`: Razorpay key secret

### Database Configuration
```python
SQLALCHEMY_DATABASE_URI = 'sqlite:///careernavigator.db'
```

## 8. Payment Integration

### Stripe Integration
- Direct payment processing
- Webhook handling for event processing
- Success/failure page redirection
- Transaction recording

### Package Tiers
- **Basic Plan**: $49/month
  - 1 Career Counseling Session
  - Resume Review
  - Access to Webinar Library
  - Basic Resource Access

- **Premium Plan**: $99/month
  - 3 Career Counseling Sessions
  - Resume & Cover Letter Review
  - Access to All Webinars
  - Full Resource Access
  - 1 Mock Interview
  - Mentorship Matching

- **Ultimate Plan**: $149/month
  - Unlimited Career Counseling
  - Priority Resume & Cover Letter Review
  - VIP Access to All Events
  - Premium Resource Access
  - Unlimited Mock Interviews
  - Priority Mentorship Matching
  - Mental Health Support Sessions

## 9. Security Features
- Password protection
- Session management
- Email verification for counselors
- Admin approval system for counselors
- CORS protection
- Secure payment processing
- Webhook signature verification

## 10. Scheduled Tasks
- Notification management using APScheduler
- Email scheduling for system notifications
- Status updates for scheduled notifications
- Payment status monitoring and updates

## 11. API Endpoints

### Landing Page Routes
- `/`: Main landing page
- `/about`: About information page
- `/services`: Service information and package selection
- `/counselor`: Counselor information page
- `/student`: Student information page
- `/faq`: Frequently asked questions
- `/contact`: Contact information page
- `/meeting`: Meeting card display
- `/meeting-room`: Virtual meeting room
- `/meeting-join`: Meeting join interface

### Student Routes
- `/register`: Student registration
- `/student_login`: Student login
- `/stud_dash`: Student dashboard
- `/find_counselors`: Counselor discovery
- `/schedule`: Appointment scheduling
- `/stud_appointments`: View appointments
- `/resources`: Access educational resources
- `/feedback`: Submit counselor feedback
- `/settings`: Account settings
- `/stud_logout`: Logout

### Counselor Routes
- `/coun_regi`: Counselor registration
- `/coun_login`: Counselor login
- `/verify_login`: Verification code validation
- `/counselor_dash`: Counselor dashboard
- `/coun_appointment`: Manage appointments
- `/coun_view_stud`: View student profiles
- `/manage_resources`: Upload and manage resources
- `/coun_feedback`: View received feedback
- `/coun_profile`: Manage professional profile

### Admin Routes
- `/admin_dash`: Admin dashboard
- `/students`: Manage student accounts
- `/edit_stud/<id>`: Edit student profiles
- `/delete_stud/<id>`: Delete student accounts
- `/counselors`: Manage counselor accounts
- `/approve_counselor`: Counselor approval process
- `/interests`: Manage interest categories
- `/add_interest`: Add new interests
- `/delete_interest/<id>`: Remove interests
- `/appointments`: Monitor appointments
- `/monitor_resources`: Review uploaded resources
- `/reports`: View system analytics
- `/notifications`: Manage system notifications
- `/get_notifications`: Retrieve notification data
- `/admins`: Admin account management
- `/logout`: Admin logout

### Payment Routes
- `/payment`: Payment page with package details
- `/create-checkout-session`: Creates Stripe checkout session
- `/payment_success`: Payment success page
- `/payment_failed`: Payment failure page
- `/stripe-webhook`: Webhook endpoint for Stripe events
- `/test_razorpay`: Test Razorpay integration

## 12. Additional Features

### Notification System
- Scheduled notifications
- Email delivery
- Status tracking (scheduled, sent)
- Background processing

### Resource Management
- File upload and storage
- Categorization
- Download tracking
- Access controls

### Meeting System
- Virtual meeting rooms
- Meeting join functionality
- Scheduling integration

### Analytics
- Interest popularity tracking
- Student engagement metrics
- Counselor performance analytics
- Resource usage statistics

## 13. Future Enhancements
1. Real-time chat integration
2. Enhanced video conferencing capabilities
3. Advanced analytics and reporting
4. Mobile application development
5. AI-powered career path recommendations
6. Subscription management portal
7. Advanced payment options (installments, promotions)
8. Integration with job boards and application tracking

## 14. Deployment Considerations
1. Database backup strategy
2. Email service configuration
3. Static file serving optimization
4. Security hardening
5. Performance monitoring and optimization
6. SSL configuration for secure payments
7. Webhook endpoint security
8. Scaling strategies for increased user load

## 15. Getting Started

### Prerequisites
- Python 3.8+
- pip package manager
- SQLite
- Stripe account
- Razorpay account (optional)
- SMTP email account

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/career-navigator.git
cd career-navigator
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Initialize the database
```bash
python init_db.py
```

4. Configure environment variables
```bash
export SECRET_KEY='your-secret-key'
export MAIL_USERNAME='your-email@gmail.com'
export MAIL_PASSWORD='your-email-password'
export STRIPE_SECRET_KEY='your-stripe-secret-key'
export STRIPE_WEBHOOK_SECRET='your-stripe-webhook-secret'
export RAZORPAY_KEY_ID='your-razorpay-key-id'
export RAZORPAY_KEY_SECRET='your-razorpay-key-secret'
```

5. Run the application
```bash
python app.py
```

6. Access the application

## 16. Testing

### Manual Testing
1. Test user registration and login flows
2. Verify counselor approval process
3. Test payment processing
4. Validate resource uploading and downloading
5. Check appointment scheduling functionality

### Automated Testing
Future implementation of:
- Unit tests for core functions
- Integration tests for workflows
- API endpoint testing
- Payment workflow testing

## 17. Maintenance

### Regular Tasks
1. Database backups
2. Log monitoring
3. Security updates
4. Performance optimization
5. Content updates

### Troubleshooting
Common issues and solutions:
- Payment processing failures
- Email delivery issues
- Database connection problems
- Session management errors

## 18. Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## 19. License
This project is licensed under the MIT License - see the LICENSE.md file for details

## 20. Support
For support, email support@careernavigator.com or create an issue in the repository.
