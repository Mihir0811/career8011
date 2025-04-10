from flask_sqlalchemy import SQLAlchemy
from datetime import datetime,timezone
from sqlalchemy.types import JSON


db = SQLAlchemy()

class Admin(db.Model):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    contact_number = db.Column(db.String(10), nullable=False)
    security_question = db.Column(db.String(255), nullable=False)
    security_answer = db.Column(db.String(255), nullable=False) 
    profile_picture = db.Column(db.String(255), nullable=True)  
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))

class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    contact_number = db.Column(db.String(15), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    con_password = db.Column(db.String(255), nullable=False)
    interests = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))

    feedbacks = db.relationship('Feedback', back_populates='student')


class Counselor(db.Model):
    __tablename__ = 'counselors'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    full_name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    contact_number = db.Column(db.String(15), nullable=False)
    specialization = db.Column(db.String(50), nullable=False)
    bio = db.Column(db.String(500), nullable=False)
    profile_picture = db.Column(db.String(255), nullable=True)
    interests = db.Column(db.Text, nullable=True) 
    approval_status = db.Column(db.String(20), nullable=False, default='pending')
    verification_code = db.Column(db.Integer, nullable=False,default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))

    feedbacks = db.relationship('Feedback', back_populates='counselor')
    schedules = db.relationship('CounselorSchedule', back_populates='counselor', cascade="all, delete-orphan")

class CounselorSchedule(db.Model):
    __tablename__ = 'counselor_schedules'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    counselor_id = db.Column(db.Integer, db.ForeignKey('counselors.id'), nullable=False)
    day_of_week = db.Column(db.String(15), nullable=False)
    time_slots = db.Column(JSON, nullable=False)

    counselor = db.relationship('Counselor', back_populates='schedules')

class Appointment(db.Model):
    __tablename__ = 'appointments'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    counselor_id = db.Column(db.Integer, db.ForeignKey('counselors.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time_slot = db.Column(db.String(50), nullable=False)
    purpose = db.Column(db.Text, nullable=True)

    student_status = db.Column(
        db.Enum('none', 'upcoming','live','in-progress', 'completed', 'canceled', name='student_status_enum'), 
        nullable=False, 
        default='none'
    )
    counselor_status = db.Column(
        db.Enum('pending', 'approved', 'rejected','canceled','completed', name='counselor_status_enum'), 
        nullable=False, 
        default='pending'
    )

    session_link = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=True, onupdate=datetime.now(timezone.utc))

    student = db.relationship('Student', backref='appointments')
    counselor = db.relationship('Counselor', backref='appointments')


class Interest(db.Model):
    __tablename__='interest'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    interest_name = db.Column(db.String(255), unique=True, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    recipients = db.Column(db.String(50), nullable=False)
    schedule_time = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='sent') 
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))

class Resource(db.Model):
    __tablename__ = 'resources'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(100), nullable=True)
    category = db.Column(db.String(50), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    file_size = db.Column(db.String(50), nullable=False)
    file_link = db.Column(db.String(255), nullable=False)
    downloads = db.Column(db.Integer, nullable=False, default=0)  
    date_uploaded= db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    counselor_id = db.Column(db.Integer, nullable=False)

class Feedback(db.Model):
    __tablename__ = 'feedbacks'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    counselor_id = db.Column(db.Integer, db.ForeignKey('counselors.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    feedback_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))

    counselor = db.relationship('Counselor', back_populates='feedbacks')
    student = db.relationship('Student', back_populates='feedbacks')

class AdminLogActivity(db.Model):
    __tablename__ = 'admin_log_activity'
    id = db.Column(db.Integer, primary_key=True)
    activity_type = db.Column(db.String(50), nullable=False)
    activity_desc = db.Column(db.Text, nullable=False)
    created_by = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))

class CounselorLogActivity(db.Model):
    __tablename__ = 'counselor_log_activity'
    id = db.Column(db.Integer, primary_key=True)
    activity_type = db.Column(db.String(50), nullable=False)  
    activity_desc = db.Column(db.Text, nullable=False) 
    created_by = db.Column(db.String(50), nullable=False) 
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    payment_intent_id = db.Column(db.String(255), unique=True, nullable=False)
    amount = db.Column(db.Integer, nullable=False)  # Amount in cents
    currency = db.Column(db.String(3), nullable=False, default='usd')
    status = db.Column(db.String(20), nullable=False)
    package = db.Column(db.String(50), nullable=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=True)
    counselor_id = db.Column(db.Integer, db.ForeignKey('counselors.id'), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    payment_metadata = db.Column(JSON, nullable=True)


