import os
from typing import Counter
import uuid
from flask import *
from flask_cors import CORS
import humanize
import requests
from sqlalchemy import and_, func, or_
from model import db,Student,Interest,Notification,Counselor,CounselorSchedule,Feedback,Resource,Payment,Admin,Appointment,AdminLogActivity,CounselorLogActivity
from datetime import datetime, timedelta,timezone
from apscheduler.schedulers.background import BackgroundScheduler 
from flask_mail import Mail,Message
from flask_migrate import Migrate
import random
import razorpay
import json
from config import Config
import stripe
import time
from werkzeug.security import hmac


app = Flask(__name__)
app.config.from_object('config.Config')
CORS(app)

db.init_app(app)
migrate = Migrate(app, db)

mail = Mail(app)

# Set up Stripe with your key
stripe.api_key = "sk_test_51R2sFf4DuQBaqDtl71gUnux6EbAe6Sg8Mo7m0QEshvpAPI5RB7LDodbVDN1Oj01pJBtPd3koeFa9Xa28J6rN1AJT00WwzlcMNx"

scheduler = BackgroundScheduler()

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=("rzp_test_pUXJB2ZJXV0sMk", "9eOkNocXPoKBi9se6CSvb7Gk"))



# ------------------------------------------ Api Calling For Video Call-----------------------


# def create_daily_room():
#     try:
#         api_url = app.config['DAILY_API_URL']
#         api_key = app.config['DAILY_API_KEY']

#         headers = {
#             "Authorization": f"Bearer {api_key}",
#             "Content-Type": "application/json"
#         }

#         room_data = {
#             "name": f"room-{uuid.uuid4()}",
#             "privacy": "public",
#             "properties": {
#                 "enable_chat": True,
#                 "start_audio_off": False,
#                 "start_video_off": False,
#             }
#         }
#         print("Creating Daily.co room with:")
#         print("URL:", api_url)
#         print("Headers:", headers)
#         print("Room data:", room_data)

#         response = requests.post(api_url, headers=headers, json=room_data)
#         # print("Response status:", response.status_code)
#         print("Response JSON:", response.json())
#         response.raise_for_status()  # Raise an exception for HTTP errors

#         return response.json()  # Returns the created room details
#     except Exception as e:
#         print(f"Error creating Daily.co room: {e}")
#         return None

def create_whereby_room():
    api_url = "https://api.whereby.dev/v1/meetings"
    api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmFwcGVhci5pbiIsImF1ZCI6Imh0dHBzOi8vYXBpLmFwcGVhci5pbi92MSIsImV4cCI6OTAwNzE5OTI1NDc0MDk5MSwiaWF0IjoxNzQ0MDM1MDIzLCJvcmdhbml6YXRpb25JZCI6MzEzNzkyLCJqdGkiOiJiZDA5YzY0YS04Y2NjLTQ1MjEtOTM4YS00Mzg5MjgwZjMzZWYifQ.nNe0sMP1kkPeLlDUA4x7v42ycT00V1lBSCuGzQyLSus"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    now = datetime.utcnow()
    payload = {
        "endDate": (now + timedelta(hours=1)).isoformat() + "Z",
        "fields": ["hostRoomUrl", "roomUrl", "roomName"]
    }

    try:
        response = requests.post(api_url, json=payload, headers=headers)
        response.raise_for_status()

        data = response.json()
        print("Room created:", data)

        return data
    except Exception as e:
        print("Failed to create Whereby room:", e)
        return None

    
# ------------------------------ Recent Activitiy Logs --------------------------------
def admin_activity(activity_type, activity_desc, created_by):
    new_activity = AdminLogActivity(
        activity_type=activity_type,
        activity_desc=activity_desc,
        created_by=created_by,
        created_at=datetime.now()
    )
    db.session.add(new_activity)
    db.session.commit()

def counselor_activity(activity_type, activity_desc, created_by):
    new_activity = CounselorLogActivity(
        activity_type=activity_type,
        activity_desc=activity_desc,
        created_by=created_by,
        created_at=datetime.now()
    )
    db.session.add(new_activity)
    db.session.commit()

# ------------------------------ Apscheduler--------------------------------

@app.route('/send_scheduled_notifications')
def send_scheduled_notifications():
    try:
        now = datetime.now()
        formatted_now = now.strftime('%Y-%m-%d %H:%M:%S')

        with app.app_context():
            notifications_to_update = Notification.query.filter(
                Notification.status == 'scheduled',
                db.func.strftime('%Y-%m-%d %H:%M:%S', Notification.schedule_time) <= formatted_now
            ).all()

            if notifications_to_update:
                print(f"Current UTC time: {now}")
                print(f"Notifications to update: {len(notifications_to_update)}")
                for notification in notifications_to_update:
                    print(f"Notification: ID={notification.id}, Schedule Time={notification.schedule_time}")

                rows_updated = Notification.query.filter(
                    Notification.status == 'scheduled',
                    db.func.strftime('%Y-%m-%d %H:%M:%S', Notification.schedule_time) <= formatted_now
                ).update({"status": "sent"})
                db.session.commit()
                print(f"{rows_updated} rows updated")
                return jsonify({'status': 'Updated', 'count': rows_updated}), 200
            else:

                print("No notifications to update.")
                return jsonify({'status': 'No Updates', 'count': 0})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'Error', 'message': str(e)})

def update_appointments():
    try:
        with app.app_context():
            now = datetime.now()  # Get the current time
            formatted_now = now.strftime('%Y-%m-%d %H:%M:%S')  # Format as string
            # print(f"Current Time (formatted): {formatted_now}")

            appointments = Appointment.query.filter(
                Appointment.counselor_status == 'approved',
                Appointment.student_status == 'upcoming'
            ).all()

            if not appointments:
                print("No appointments to process.")
                return

            for appointment in appointments:
                try:
                    session_time = datetime.combine(
                        appointment.date,
                        datetime.strptime(appointment.time_slot.split(' - ')[0], '%H:%M').time()
                    )

                    formatted_session_time = session_time.strftime('%Y-%m-%d %H:%M:%S')
                    # print(f"Appointment ID={appointment.id}, Session Time (formatted)={formatted_session_time}, Current Time={formatted_now}")

                    # Compare as datetime objects
                    if now >= session_time:
                        appointment.student_status = 'live'
                        print(f"Updating Appointment ID={appointment.id} to live.")
                        try:
                            send_email(
                                appointment.student.email,
                                "Session is now live",
                                f"Your session scheduled for {appointment.purpose} on {appointment.date} at {appointment.time_slot.split(' - ')[0]} is now live."
                            )
                            print(f"Email sent to student: {appointment.student.email}")
                        except Exception as e:
                            print(f"Error sending email to student: {e}")

                        try:
                            send_email(
                                appointment.counselor.email,
                                "Session is now live",
                                f"Your session scheduled for {appointment.purpose} on {appointment.date} at {appointment.time_slot.split(' - ')[0]} is now live."
                            )
                            print(f"Email sent to counselor: {appointment.counselor.email}")
                        except Exception as e:
                            print(f"Error sending email to counselor: {e}")

                except Exception as e:
                    print(f"Error processing Appointment ID={appointment.id}: {e}")

            db.session.commit()
    except Exception as e:
        print(f"Error in update_appointments: {e}")


with app.app_context():
    scheduler.add_job(send_scheduled_notifications, 'interval', minutes=1, replace_existing=True)
    scheduler.add_job(update_appointments, 'interval', minutes=1,replace_existing=True)
    scheduler.start()


def send_email(to, subject, body):
    msg = Message(subject, sender=app.config['MAIL_USERNAME'], recipients=[to])
    msg.body = body
    try:
        mail.send(msg)
        print(f"Email sent to {to}")
    except Exception as e:
        print(f"Error sending email to {to}: {e}")



# =========================================================================================== #
# ------------------------------------Admin Panel-------------------------------------------- #
# =========================================================================================== #


@app.route('/admin_regi', methods=['GET', 'POST'])
def admin_regi():
    if request.method == 'POST':
        try:
            full_name = request.form.get('fullName')
            email = request.form.get('email')
            username = request.form.get('username')
            password = request.form.get('password')
            contact_number = request.form.get('contactNumber')
            security_question = request.form.get('securityQuestion')
            security_answer = request.form.get('securityAnswer')

            profile_picture = request.files.get('profilePicture')

            if profile_picture:
                filename = profile_picture.filename
                file_path = f"static/img/admin_uploads/{filename}"
                profile_picture.save(file_path)

            if not all([full_name, email, username, password, contact_number, security_question, security_answer]):
                return jsonify({'success': False, 'message': 'All fields are required.'})

            if Admin.query.filter((Admin.email == email) | (Admin.username == username)).first():
                return jsonify({'success': False, 'message': 'Email or username already exists.'})


            new_admin = Admin(
                full_name = full_name,
                email = email,
                username = username,
                password = password,
                contact_number = contact_number,
                security_question = security_question,
                security_answer = security_answer,
                profile_picture = file_path
            )

            db.session.add(new_admin)
            db.session.commit()

            return jsonify({'success': True, 'message': 'Admin registered successfully!'}), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 401

    return render_template('admin/admin_regi.html')

@app.route('/admin_login', methods=['POST', 'GET'])
def admin_login():
    if request.method == 'GET':
        return render_template('admin/admin_login.html')

    if request.method == 'POST':
        try:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return jsonify({'success': False, 'message': 'Username and password are required.'}), 400

            admin = Admin.query.filter_by(username=username).first()

            if admin and admin.password == password:
                session['admin_id'] = admin.id
                session['admin_name'] = admin.username
                session['user_type'] = 'admins'

                print("Session created for admin:", session['admin_name'])
                return jsonify({'success': True, 'message': 'Login successful!'}), 201
            else:
                return jsonify({'success': False, 'message': 'Invalid username or password.'}), 401
        except Exception as e:
            return jsonify({'success': False, 'message': 'An error occurred.', 'error': str(e)}), 500



@app.route('/admin_dash')
def dashboard():
    if 'admin_id' not in session or 'admin_name' not in session:
        return redirect(url_for('admin_login'))
    
    activities = AdminLogActivity.query.order_by(AdminLogActivity.created_at.desc()).limit(3).all()

    formatted_activities = [{
        "type": activity.activity_type,
        "description": activity.activity_desc,
        "created_by": activity.created_by,
        "created_at": humanize.naturaltime(activity.created_at)
    } for activity in activities]


    return render_template('admin/dashboard.html', active_page='dashboard', activities=formatted_activities)


@app.route('/students',methods=['GET'])
def students():
    if request.method == 'GET':
        if 'admin_name' in session:
            print(session['admin_name'])
        else:
            return redirect(url_for('admin_login'))
        students = Student.query.all()
        return render_template('admin/manage_stud.html', active_page='students',students=students)

@app.route('/edit_stud/<int:student_id>', methods=['GET', 'PUT'])
def edit_stud(student_id):
    student = db.session.get(Student, student_id)
    if request.method == 'GET':
        interests = Interest.query.all()
        return render_template('admin/edit_stud.html', active_page='students', student=student, interests=interests)

    if request.method == 'PUT':
        data = request.get_json()
        print(data)
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        selected_interests = data.get('interests', [])

        if not name or not email or len(selected_interests) < 2:
            return jsonify({'msg': 'Invalid Input!'}), 400

        old_name = student.name
        old_email = student.email
        old_interests = student.interests

        student.name = name
        student.email = email
        student.interests = ','.join(selected_interests)
        db.session.commit()

        admin_activity(
            activity_type='edition',
            activity_desc=(
                f"Student '{old_name}' was updated by {session.get('admin_name', 'Admin')}. "
                f"Changes: Name ({old_name} -> {name}), Email ({old_email} -> {email}), "
                f"Interests ({old_interests} -> {','.join(selected_interests)})."
            ),
            created_by=session.get('admin_name', 'Admin')
        )

        return jsonify({'msg': 'Student Updated Successfully!'}), 200


@app.route('/delete_stud/<int:student_id>',methods=['DELETE'])
def delete_stud(student_id):
    student = Student.query.get_or_404(student_id)

    if not student:
        return jsonify({'msg' : 'Interest Not Found!'}), 404
    
    Feedback.query.filter_by(student_id=student_id).delete()
    Appointment.query.filter_by(student_id=student_id).delete()

    db.session.delete(student)
    db.session.commit()

    admin_activity(
        activity_type='deletion',
        activity_desc=f"Admin {session['admin_name']} deleted student '{student.name}'",
        created_by=session['admin_name']
    )
    
    return jsonify({'msg':'Student Deleted Successfully!'}), 200
    


@app.route('/counselors')
def counselors():
    counselors = Counselor.query.all()
    return render_template('admin/manage_counselor.html', active_page='counselors',counselors=counselors)

@app.route('/approve_counselor', methods=['POST'])
def approve_counselor():
    data = request.get_json()
    counselor_id = data.get('counselor_id')
    action = data.get('action')

    counselor = Counselor.query.get_or_404(counselor_id)

    if action == 'approve':
        if counselor.approval_status == 'approved':
            return jsonify({'success': False, 'error': 'Counselor is already approved!'}), 400

        counselor.approval_status = 'approved'

        verification_code = random.randint(100000,999999)
        counselor.verification_code = verification_code
        db.session.commit()

        admin_activity(
            activity_type='approval',
            activity_desc=f"{counselor.full_name} was approved by {session.get('admin_name')}",
            created_by=session.get('admin_name', 'Admin')
        )

        msg = Message(
            'Approval Notification',
            sender=app.config['MAIL_USERNAME'],
            recipients=[counselor.email]
        )
        msg.body = (
            f"Dear {counselor.full_name},\n\n"
            f"Congratulations! Your profile has been approved. "
            f"You can now log in and access your account.\n\n"
            f"Here is your verification code: {verification_code}\n\n"
            f"Best regards,\nCareerNavigator Team"
        )
        try:
            mail.send(msg)
            return jsonify({'success': True, 'message': 'Counselor approved and notification email sent.'})
        except Exception as e:
            return jsonify({'success': False, 'error': 'Email failed to send.'}), 500

    elif action == 'reject':
        if counselor.approval_status == 'rejected':
            return jsonify({'success': False, 'error': 'Counselor is already rejected.'}), 400

        counselor.approval_status = 'rejected'
        db.session.commit()
        return jsonify({'success': True, 'message': 'Counselor rejected.'}), 200

    return jsonify({'success': False, 'error': 'Invalid action.'})

# ---------------------------------- Interests -----------------------------------


@app.route('/interests')
def interests():
    all_interest = Interest.query.all()
    return render_template('admin/interests.html',interests=all_interest, active_page='interests')

#-------------- Add Interests

@app.route('/add_interest', methods=['GET', 'POST'])
def add_interest():
    if request.method == 'GET':
        return render_template('admin/add_interest.html',active_page='interests')
    
    if request.method == 'POST':
            data = request.get_json()
            interest_name = data.get('interest_name', '').strip()
            category = data.get('category', '').strip().title()

            if not interest_name or not category:
                return jsonify({'msg': 'Fields Are Required!'}), 400

            existing_interest = Interest.query.filter(
                db.func.lower(Interest.interest_name) == interest_name.lower()
            ).first()

            if existing_interest:
                return jsonify({'msg': 'Interest Already Exists!'}), 400

            new_interest = Interest(
                interest_name=interest_name,
                category=category
            )
            db.session.add(new_interest)
            db.session.commit()

            admin_activity(
            activity_type='addition',
            activity_desc=f"New Interest '{interest_name}' added by {session['admin_name']}",
            created_by=session['admin_name']
            )
            return jsonify({'msg': 'Interest Added Successfully!'}), 200
    

#-------------- Delete Interests ----------------------------------------------------

@app.route('/delete_interest/<int:interest_id>', methods=['DELETE'])
def delete_interest(interest_id):
    interest = Interest.query.get(interest_id)

    if not interest:
        return jsonify({'msg' : 'Interest Not Found!'}), 404
    
    db.session.delete(interest)
    db.session.commit()
    return jsonify({'msg' : 'Interest Deleted Successfully!'}), 200

# ------------------------------------------------------------------------------------

@app.route('/appointments')
def appointments():
    appointments = (
        db.session.query(Appointment)
        .join(Student, Appointment.student_id == Student.id)
        .join(Counselor, Appointment.counselor_id == Counselor.id)
        .all()
    )
    return render_template('admin/appointments.html', active_page='appointments',appointments=appointments)

@app.route('/monitor_resources')
def monitor_resources():

    resources = Resource.query.all()    
    counselor_names = {
        counselor.id: counselor.full_name
        for counselor in Counselor.query.all()
    }

    resource_types = list(set(resource.file_type for resource in resources))
    managed_by = list(set(counselor_names.get(resource.counselor_id, 'Unknown') for resource in resources))

    resources_with_counselor = [
        {
            'id': resource.id,
            'title': resource.title,
            'category': resource.category,
            'file_type': resource.file_type,
            'date_uploaded': resource.date_uploaded,
            'counselor_name': counselor_names.get(resource.counselor_id, 'Unknown')
        }
        for resource in resources
    ]

    return render_template(
        'admin/monitor_resource.html',
        resources=resources_with_counselor,
        resource_types=resource_types,
        managed_by=managed_by,
        active_page='monitor_resources'
    )

@app.route('/monitor_feedbacks', methods=['GET'])
def monitor_feedbacks():
    rating = request.args.get('rating')
    if rating and rating.isdigit():
        feedbacks = Feedback.query.filter(Feedback.rating == int(rating)).all()
    else:
        feedbacks = Feedback.query.all()
    if request.args.get('ajax'):  
        return jsonify([{
            'counselor_name': feedback.counselor.full_name,
            'student_name': feedback.student.name,
            'description': feedback.feedback_text,
            'rating': feedback.rating
        } for feedback in feedbacks])
    return render_template('admin/monitor_feedbacks.html', feedbacks=feedbacks, active_page='monitor_feedbacks')


# --------------------------- Reports ------------------------------------
@app.route('/reports')
def reports():
    return render_template('admin/reports.html', active_page='reports')


@app.route('/popular_interests', methods=['GET'])
def popular_interests():
    try:
        students = Student.query.all()
        interests_list = []
        for student in students:
            if student.interests:
                interests_list.extend(student.interests.split(','))

        interest_counts = Counter(interests_list)

        data = [{'interest': interest, 'count': count} for interest, count in interest_counts.items()]

        return jsonify({'status': 'success', 'data': data}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    
@app.route('/counselor_report', methods=['GET'])
def feedback_ratings_chart():
    
    feedback_data = db.session.query(
        Feedback.counselor_id,
        func.avg(Feedback.rating).label('avg_rating')
    ).group_by(Feedback.counselor_id).all()

    
    counselors = Counselor.query.all()
    counselor_names = {counselor.id: counselor.full_name for counselor in counselors}

    chart_data = {
        'labels': [],   
        'data': []   
    }

    for feedback in feedback_data:
        counselor_id = feedback.counselor_id
        chart_data['labels'].append(counselor_names.get(counselor_id, 'Unknown'))
        chart_data['data'].append(feedback.avg_rating)


    return jsonify(chart_data)

@app.route('/students_counselors_count', methods=['GET'])
def students_counselors_count():
    try:
        student_count = db.session.query(Student).count()
        counselor_count = db.session.query(Counselor).count()

        chart_data = {
            'labels': ['Students', 'Counselors'],  
            'data': [student_count, counselor_count]  
        }


        return jsonify(chart_data)

    except Exception as e:
        print(f"Error fetching students and counselors count: {e}")
        return jsonify({'message': 'Error fetching data'}), 500
    

@app.route('/overall_appointment_chart', methods=['GET'])
def overall_appointment_chart():
    try:
        status_counts = db.session.query(
            Appointment.counselor_status,
            func.count(Appointment.counselor_status).label('status_count')
        ).group_by(Appointment.counselor_status).all()

        statuses = ["pending", "approved", "rejected", "canceled", "completed"]
        status_data = {status: 0 for status in statuses}  

        for status, count in status_counts:
            status_data[status] = count

        # Prepare JSON response
        chart_data = {
            'labels': statuses,  # Status names
            'data': [status_data[status] for status in statuses]  
        }

        return jsonify(chart_data)

    except Exception as e:
        print(f"Error fetching appointment status chart: {e}")
        return jsonify({'message': 'Error fetching appointment status data'}), 500


# --------------------------- notifications ------------------------------------

@app.route('/notifications',methods=['GET','POST'])
def notifications():
    if request.method == 'GET':
        if 'admin_name' not in session:
            return redirect(url_for('admin_login'))
        notifications = Notification.query.order_by(Notification.created_at.desc()).all()
        return render_template('admin/notifications.html', active_page='notifications',notifications=notifications)

    if request.method == 'POST':
        data = request.get_json()
        title = data.get('title')
        message = data.get('message')
        recipients = data.get('recipients')
        schedule = data.get('schedule')
        schedule_time = data.get('schedule_time',None)

        if schedule == 'later' and schedule_time:
            schedule_time = datetime.fromisoformat(schedule_time).replace(tzinfo=timezone.utc)
        else:
            schedule_time = datetime.now(timezone.utc)
        
        new_notification = Notification(
            title=title,
            message=message,
            recipients=recipients,
            schedule_time=schedule_time,
            status = 'scheduled' if schedule == 'later' else 'sent'
        )
        db.session.add(new_notification)
        db.session.commit()

        return jsonify({'msg':'Notiication Added Successfully!'}), 201
    
    
@app.route('/admin_notifications', methods=['GET'])
def admin_notifications():
    try:
        notifications = Notification.query.filter_by(
            recipients='admins', status='sent'
        ).order_by(Notification.created_at.desc()).limit(3).all()

        notification_list = [
            {
                'id': notification.id,
                'title': notification.title,
                'message': notification.message,
                'created_at': notification.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'status': notification.status
            }
            for notification in notifications
        ]

        return jsonify({'notifications': notification_list})

    except Exception as e:
        print(f"Error fetching notifications for admins: {e}")
        return jsonify({'message': 'Error fetching notifications'}), 500




# @app.route('/user_notifications', methods=['GET'])
# def user_notifications():
#     try:
#         if 'admin_name' not in session:
#             return jsonify({'count': 0, 'notifications': []}), 403

#         user_type = session.get('user_type', 'admin')  # Example: 'admin', 'student', etc.

#         # Fetch notifications for the user based on their type
#         notifications = (
#             Notification.query
#             .filter(Notification.status == 'sent')
#             .filter(Notification.recipients.like(f"%{user_type}%"))
#             .order_by(Notification.schedule_time.desc())
#             .all()
#         )

#         notification_data = [
#             {
#                 'id': n.id,
#                 'title': n.title,
#                 'message': n.message,
#                 'schedule_time': n.schedule_time.strftime('%Y-%m-%d %H:%M:%S'),
#             }
#             for n in notifications
#         ]

#         return jsonify({'count': len(notification_data), 'notifications': notification_data}), 200

#     except Exception as e:
#         return jsonify({'error': str(e), 'count': 0, 'notifications': []}), 500


@app.route('/admin_profile', methods=['GET', 'POST'])
def admin_profile():
    # Get admin_id from session
    admin_id = session.get('admin_id')
    if not admin_id:
        return redirect(url_for('admin_login'))  # Redirect to login if not logged in
    
    # Fetch the admin data from the database
    admin = Admin.query.get_or_404(admin_id)

    if request.method == 'POST':
        # Handle avatar image update (upload a new avatar)
        avatar = request.files.get('avatar')
        
        if avatar:
            # Remove the old image if a new one is uploaded
            if admin.profile_picture and os.path.exists(os.path.join('static/img/admin_uploads', admin.profile_picture)):
                os.remove(os.path.join('static/img/admin_uploads', admin.profile_picture))
            
            # Ensure the uploaded filename is unique to avoid collisions
            avatar_filename = f"{admin_id}_{avatar.filename}"
            avatar_path = os.path.join('static/img/admin_uploads', avatar_filename)
            avatar.save(avatar_path)
            admin.profile_picture = avatar_filename  # Update the profile picture in the database

        # Handle account settings update
        username = request.form.get('username')
        email = request.form.get('email')
        old_pass = request.form.get('oldPass')
        new_pass = request.form.get('newPass')
        phone = request.form.get('pno')

        # Update account settings
        if username:
            admin.username = username
        if email:
            admin.email = email
        if phone:
            admin.contact_number = phone

        # Update password (No hashing for now, it's plain text)
        if old_pass and new_pass:
            if old_pass == admin.password:  # Check if old password matches
                admin.password = new_pass  # Update with the new password
            else:
                return jsonify({
                    'status': 'error',
                    'message': 'Old password is incorrect'
                })

        # Commit the changes to the database
        db.session.commit()

        # Return JSON response with updated profile info
        return jsonify({
            'status': 'success',
            'message': 'Profile and account settings updated successfully',
            'profile_picture': admin.profile_picture
        })

    # Render the admin profile page with current details
    return render_template('admin/admin_profile.html', admin=admin)

@app.route('/delete_account/<int:admin_id>', methods=['POST'])
def delete_account(admin_id):
    # Ensure the admin is logged in by checking the session
    if 'admin_id' not in session:
        return jsonify({"success": False, "message": "You need to be logged in to delete your account."}), 403

    # Ensure that the logged-in admin is the same as the one trying to delete the account
    if session['admin_id'] != admin_id:
        return jsonify({"success": False, "message": "You can only delete your own account."}), 403

    # Try to find and delete the admin from the database
    try:
        admin_to_delete = Admin.query.get(admin_id)  # Get the admin from the database
        if admin_to_delete:
            db.session.delete(admin_to_delete)  # Delete the admin
            db.session.commit()  # Commit the changes to the database
            session.clear()  # Clear the session after account deletion
            return jsonify({"success": True, "message": "Your account has been deleted successfully."}), 200
        else:
            return jsonify({"success": False, "message": "Admin account not found."}), 404
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred while deleting the account: {str(e)}"}), 500

@app.route('/admin_logout')
def admin_logout():
    session.pop('admin_name', None)
    session.pop('admin_id', None)
    return redirect(url_for('admin_login'))



# =========================================================================================== #
# ------------------------------------Student Panel------------------------------------------ #
# =========================================================================================== #



@app.route('/register',methods=['GET','POST'])
def register():

    if request.method == 'GET':
        all_interests = Interest.query.all()
        return render_template('student/register.html',interests=all_interests)
    
    if request.method == 'POST':
        data = request.get_json()
        name = data.get('fullName')
        email = data.get('email')
        contact_number = data.get('contactNumber')
        password = data.get('password')
        con_password = data.get('confirmPassword')
        interests = data.get('interests',[])

        if not (name and email and contact_number and password and con_password and interests):
            return jsonify({'msg': 'All fields are required!'}), 400

        if password != con_password:
            return jsonify({'msg': 'Passwords do not match!'}), 400
        
        if len(interests) < 2:
            return jsonify({'msg': 'Please select at least two interests!'}), 400
        
        new_student = Student(
                name=name,
                email=email,
                contact_number=contact_number,
                password=password,
                con_password=con_password,
                interests=",".join(interests)
            )
        db.session.add(new_student)
        db.session.commit()
        return jsonify({'msg': 'Student Registered Successfully!'}), 200
    
@app.route('/student_login', methods=['GET', 'POST'])
def student_login():
    if request.method == 'GET':
        # Get redirect parameters
        redirect_to = request.args.get('redirect', '')
        package = request.args.get('package', '')
        
        return render_template('student/login.html', redirect_to=redirect_to, package=package)
    
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        redirect_to = data.get('redirect_to', '')
        package = data.get('package', '')

        student = Student.query.filter_by(name=username, con_password=password).first()

        if student:
            print(student.name+" ",student.id)  
            
            session['student_id'] = student.id
            session['student_name'] = student.name
            session['user_type'] = 'students'
            
            # Handle redirect after login
            if redirect_to == 'payment':
                return jsonify({
                    'success': True,
                    'message': 'Login Successful!',
                    'redirect': f"/payment?package={package}"
                }), 200
            else:
                return jsonify({'success': True, 'message': 'Login Successful!'}), 200
        else:
            return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
        
@app.route('/forgot_pwd', methods=['GET', 'POST'])
def forgot_pwd():
    if request.method == 'POST':
        email = request.form.get('email')
        student = Student.query.filter_by(email=email).first()

        if student:
            return redirect(url_for('reset_pwd', email=email))
        else:
            flash('Email not found. Please try again.', 'error')
            return render_template('student/forgot_pwd.html')
        
    return render_template('student/forgot_pwd.html')


@app.route('/reset_pwd/<email>', methods=['GET', 'POST'])
def reset_pwd(email):
    student = Student.query.filter_by(email=email).first()

    if not student:
        flash("Invalid email or user does not exist.", "error")
        return redirect(url_for('forgot_pwd'))

    if request.method == 'POST':
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_password')

        if new_password != confirm_password:
            flash("Passwords do not match. Please try again.", "error")
            return redirect(url_for('reset_pwd', email=email))

        student.password = new_password
        db.session.commit()

        flash("Password successfully reset. You can now log in.", "success")
        return redirect(url_for('student_login'))

    return render_template('student/reset_pwd.html', email=email)

@app.route('/stud_dash')
def stud_dash():
    if 'student_name' not in session:
        return redirect(url_for('student_login'))

    student = Student.query.filter_by(name=session['student_name']).first()
    
    if not student or not student.interests:
        return redirect(url_for('student_login'))
    
    counselors = []
    if student.interests:
        student_interests = [interest.strip().lower() for interest in student.interests.split(",")]
        counselors = Counselor.query.filter(
            or_(*[Counselor.interests.ilike(f"%{interest}%") for interest in student_interests])
        ).limit(3).all()

    recent_resources = Resource.query.order_by(Resource.date_uploaded.desc()).limit(3).all()
    
    return render_template(
        'student/stud-dash.html',
        active_page='stud_dash',
        recent_resources=recent_resources,
        counselors=counselors
    )

@app.route('/find_counselors')
def find_counselors():
    if 'student_name' not in session:
        return redirect(url_for('student_login'))
    counselors = Counselor.query.filter_by(approval_status='approved')
    return render_template('student/find_counselors.html',active_page='find_counselors',counselors=counselors)

@app.route('/schedule', methods=['GET', 'POST'])
def schedule():
    if 'student_name' not in session or 'student_id' not in session:
        return redirect(url_for('student_login'))

    if request.method == 'GET':
        counselors = Counselor.query.all()
        return render_template(
            'student/schedule.html',
            active_page='schedule',
            counselors=counselors
        )

    if request.method == 'POST':
        try:
            data = request.get_json()
            print("Received Data:", data)  # Debugging

            counselor_id = data.get('counselor_id')
            appointment_date = data.get('date')
            time_slot = data.get('time_slot')
            purpose = data.get('purpose', '')

            if not counselor_id or not appointment_date or not time_slot:
                return jsonify({'message': 'All required fields must be filled out'}), 400

            appointment_date_obj = datetime.strptime(appointment_date, '%Y-%m-%d').date()

            new_appointment = Appointment(
                student_id=session.get('student_id'),
                counselor_id=int(counselor_id),
                date=appointment_date_obj,
                time_slot=time_slot,
                purpose=purpose
            )

            db.session.add(new_appointment)
            db.session.commit()

            # Fetch student and counselor details
            student = Student.query.get(session.get('student_id'))
            counselor = Counselor.query.get(int(counselor_id))

            print(f"Counselor: {counselor}, Student: {student}")  # Debugging

            if counselor and student:
                counselor_activity(
                    activity_type="New Appointment Request",
                    activity_desc=f"New appointment request from {student.name}",
                    created_by=counselor.full_name  # Use full_name here
                )

            return jsonify({'message': 'Appointment booked successfully!'}), 200

        except Exception as e:
            db.session.rollback()  # Rollback if any error occurs
            print(f"Error in scheduling appointment: {e}")  # Debugging
            return jsonify({'message': 'An error occurred while booking the appointment.'}), 500


@app.route('/get-time-slots-for-date/<int:counselor_id>/<string:selected_date>', methods=['GET'])
def get_time_slots_for_date(counselor_id, selected_date):
    print(f"Route called with counselor_id={counselor_id}, selected_date={selected_date}")
    counselor = Counselor.query.get(counselor_id)
    if not counselor:
        return jsonify({'success': False, 'message': 'Counselor not found'})

    day_of_week = datetime.strptime(selected_date, "%Y-%m-%d").strftime('%A')
    print(f"Day of Week: {day_of_week}")

    schedules = CounselorSchedule.query.filter_by(
        counselor_id=counselor_id,
        day_of_week=day_of_week
    ).all()
    print(f"Schedules: {schedules}")

    time_slots = []
    for schedule in schedules:
        print(f"Schedule: {schedule}")
        time_slot = schedule.time_slots
        time_slots.append(f"{time_slot['startTime']} - {time_slot['endTime']}")

    print(f"Time Slots: {time_slots}")
    return jsonify({'success': True, 'time_slots': time_slots})



@app.route('/get_availability/<int:counselor_id>', methods=['GET'])
def get_availability(counselor_id):
    schedules = db.session.query(CounselorSchedule).filter_by(counselor_id=counselor_id).all()

    availability = {}
    for schedule in schedules:
        if schedule.day_of_week not in availability:
            availability[schedule.day_of_week] = []
        availability[schedule.day_of_week].append(schedule.time_slots)

    available_days = list(availability.keys())
    time_slots = availability

    print(f"Available days: {available_days}", flush=True)
    print(f"Time slots: {time_slots}", flush=True)

    return jsonify({
        'available_days': available_days,
        'time_slots': time_slots
    })


@app.route('/stud_appointments', methods=['GET', 'POST'])
def stud_appointments():
    if 'student_name' not in session:
        return redirect(url_for('student_login'))
    
    student_id = session.get('student_id')
    
    if request.method == 'GET':
        upcoming_appointments = Appointment.query.filter_by(student_id=student_id, student_status='upcoming').all()
        completed_appointments = Appointment.query.filter_by(student_id=student_id, student_status='completed').all()
        canceled_appointments = Appointment.query.filter_by(student_id=student_id, student_status='canceled').all()

        return render_template(
            'student/appointments.html',
            active_page='appointments',
            upcoming_appointments=upcoming_appointments,
            completed_appointments=completed_appointments,
            canceled_appointments=canceled_appointments
        )
    
@app.route('/stud_room', methods=['GET'])
def stud_room():
    if request.method == 'GET':
        if 'student_id' not in session:
            return redirect(url_for('student_login'))
    
    student_id = session['student_id']
    live_appointments = Appointment.query.filter_by(
        student_id=student_id,
        student_status='live'
    ).all()

    return render_template('student/stud_room.html', appointments=live_appointments, active_page='stud_room')


@app.route('/join_meeting/<int:appointment_id>', methods=['GET'])
def join_meeting(appointment_id):
    try:
        if 'student_id' not in session:
            return redirect(url_for('stud_login'))

        student_id = session['student_id']
        appointment = Appointment.query.filter_by(id=appointment_id, student_id=student_id).first()

        if not appointment:
            return "Appointment not found or unauthorized access.", 404

        if appointment.student_status != 'live':
            return "Meeting is not ready to join yet.", 400

        return render_template(
            'student/join_meeting.html',
            session_link=appointment.session_link,
            student_name=session['student_name'],
            active_page="stud_room"
        )
    except Exception as e:
        print(f"Error joining meeting: {e}")
        return url_for(redirect('stud_room'))


    
@app.route('/resources')
def resources():
    if 'student_name' not in session:
        return redirect(url_for('student_login'))

    resources_data = Resource.query.all()

    resources = [
        {
            "id": resource.id,
            "title": resource.title,
            "category": resource.category,
            "description": resource.description, 
            "file_type": resource.file_type,
            "file_size": resource.file_size,
            "downloads": resource.downloads,
            "file_link": f"/static/resources/{resource.title.lower().replace(' ', '_')}.{resource.file_type}"
        }
        for resource in resources_data
    ]


    categories = ["all"] + list(set([resource.category for resource in resources_data]))

    return render_template('student/resources.html', categories=categories, resources=resources, active_page='resources')


@app.route('/download_resource/<int:resource_id>',methods=['GET'])
def download_resource(resource_id):
    resource = Resource.query.get_or_404(resource_id)

    resource.downloads += 1
    db.session.commit()

    file_path = resource.file_link

    try:
        return send_file(file_path,as_attachment=True)
    except FileNotFoundError:
        return f"File Not Found : {file_path}!", 404
    

@app.route('/feedback',methods=['GET','POST'])
def feedback():
    if 'student_name' not in session:
        return redirect(url_for('student_login'))
    
    student = Student.query.filter_by(name=session['student_name']).first()
    if not student:
        return redirect(url_for('student_login'))
    
    
    if request.method == 'GET':
        counselors = Counselor.query.filter_by(approval_status='approved')
        return render_template('student/feedback.html',active_page='feedback',counselors=counselors)
    
    if request.method == 'POST':
        data = request.get_json()
        counselor_id = data.get('couselor_id')
        rating = data.get('rating')
        feedback_text = data.get('feedback_text')

        if not counselor_id or not rating or not feedback_text:
            return jsonify({'error':'All Fields Are Required!'}), 400
        
        student = Student.query.filter_by(name=session['student_name']).first()
        if not student:
            return jsonify({'error':'Student Not Found!'}), 404
        
        feedback = Feedback(
            counselor_id = counselor_id,
            student_id = student.id,
            rating = rating,
            feedback_text = feedback_text
        )
        
        db.session.add(feedback)
        db.session.commit()

        counselor = Counselor.query.get(counselor_id)
        if counselor:
            counselor_activity(
                activity_type="New Feedback Received",
                activity_desc=f"You Receive New Feedback From {student.name}",
                created_by=counselor.full_name
            )

        return jsonify({'message':'Feedback Submitted Successfully!'}), 201
    

@app.route('/stud_prof')
def stud_prof():
    if 'student_name' not in session:
        return redirect(url_for('student_login'))

    student = Student.query.filter_by(name=session['student_name']).first()
    if not student:
        return redirect(url_for('student_login'))
    
    return render_template('student/stud_prof.html', active_page='stud_prof', student=student)

@app.route('/update_student_prof', methods=['POST'])
def update_student():
    if 'student_name' not in session:
        return jsonify({'error': 'Unauthorized access'}), 401

    data = request.json
    student = Student.query.filter_by(name=session['student_name']).first()
    
    if student:
        student.name = data.get('name', student.name)
        student.email = data.get('email', student.email)
        student.contact_number = data.get('contact_number', student.contact_number)
        student.password = data.get('new_password', student.password) 

        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'})
    
    return jsonify({'error': 'Student not found'}), 404

@app.route('/student_notifications', methods=['GET'])
def student_notifications():
    try:
        notifications = Notification.query.filter_by(
            recipients='students', status='sent'
        ).order_by(Notification.created_at.desc()).limit(3).all()

        notification_list = [
            {
                'id': notification.id,
                'title': notification.title,
                'message': notification.message,
                'created_at': notification.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'status': notification.status
            }
            for notification in notifications
        ]

        return jsonify({'notifications': notification_list})

    except Exception as e:
        print(f"Error fetching notifications for students: {e}")
        return jsonify({'message': 'Error fetching notifications'}), 500


@app.route('/stud_logout')
def stud_logout():
    session.pop('student_name',None)
    session.pop('student_id',None)
    return redirect(url_for('student_login'))


# ============================================================================================ #
# ------------------------------------Counselor Panel----------------------------------------- #
# ============================================================================================ #

@app.route('/coun_regi', methods=['GET', 'POST'])
def coun_regi():
    if request.method == 'GET':
        all_interests = Interest.query.all()
        interests = [{'id': interest.id, 'interest_name': interest.interest_name} for interest in all_interests]
        return render_template('counselor/coun_regi.html', interests=interests)

    if request.method == 'POST':
            full_name = request.form.get('fullName')
            print(full_name)
            email = request.form.get('email')
            password = request.form.get('password')
            contact_number = request.form.get('contactNumber')
            specialization = request.form.get('specialization')
            interests = request.form.get('selectedInterests')
            bio = request.form.get('bio')

            profile_picture = request.files.get('profilePicture')
            profile_picture_path = None

            if profile_picture and profile_picture.filename != '':
                filename = profile_picture.filename
                profile_picture_path = f"static/img/coun_uploads/{filename}"
                profile_picture.save(profile_picture_path)

            new_counselor = Counselor(
                full_name=full_name,
                email=email,
                password=password,
                contact_number=contact_number,
                specialization=specialization,
                bio=bio,
                profile_picture=profile_picture_path,
                interests=interests
            )
            db.session.add(new_counselor)
            db.session.flush() 

            availability_days = json.loads(request.form.get('availabilityDays', '[]'))
            availability_slots = json.loads(request.form.get('availabilitySlots', '{}'))

            for day in availability_days:
                if day in availability_slots:
                    for slot in availability_slots[day]:
                        new_schedule = CounselorSchedule(
                            counselor_id=new_counselor.id,
                            day_of_week=day,
                            time_slots=slot
                        )
                        db.session.add(new_schedule)

            db.session.commit()

            return jsonify({'msg': 'Registration is done successfully!'}), 201

@app.route('/coun_login',methods=['GET','POST'])
def coun_login():
    if request.method == 'GET':
        return render_template('counselor/coun_login.html')
    
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
                return jsonify({"status": "error", "message": "All fields are required!"}), 400

        counselor = Counselor.query.filter_by(
                email=email,
                password=password,
            ).first()

        if counselor:
            session['counselor_id'] = counselor.id 
            session['counselor_name'] = counselor.full_name
            session['user_type'] = 'counselors'
            return jsonify({"status": "success", "message": "Login successful!"}), 200
        else:
            return jsonify({"status": "error", "message": "Invalid login credentials!"}), 401
    
@app.route('/verify_login', methods=['POST'])
def verify_login():
    if 'counselor_id' not in session:
        return jsonify({"status": "error", "message": "Session expired. Please log in again."}), 401
    
    counselor_id = session.get('counselor_id')

    data = request.get_json()
    verification_code = data.get('verification_code')

    if not verification_code:
        return jsonify({"status": "error", "message": "Verification code is required."}), 400
    
    counselor = Counselor.query.filter_by(id=counselor_id,verification_code=verification_code).first()

    if counselor:
        session['counselor_id'] = counselor.id
        session['counselor_name'] = counselor.full_name
        return jsonify({"status": "success", "message": "Verification successful!"}), 200
    else:
        return jsonify({"status": "error", "message": "Invalid verification code."}), 401


@app.route('/counselor_dash')
def counselor_dash():
    if 'counselor_id' and 'counselor_name' not in session:
        return redirect(url_for('coun_login'))
    counselor = Counselor.query.get_or_404(session['counselor_id'])
    profile_picture = counselor.profile_picture

    recent_activities = CounselorLogActivity.query.filter_by(created_by=counselor.full_name) \
        .order_by(CounselorLogActivity.created_at.desc()).limit(3).all()

    return render_template('counselor/counselor_dash.html',active_page='counselor_dash',profile_picture=profile_picture,recent_activities=recent_activities)

@app.route('/coun_appointment',methods=['GET'])
def coun_appointment():
    if 'counselor_id' and 'counselor_name' not in session:
        return redirect(url_for('coun_login'))
    
    counselor_id = session['counselor_id']
    
    appointments = db.session.query(Appointment).join(Student).filter(Appointment.counselor_id == counselor_id).all()

    print(appointments)
    appointment_list = [
        {
            'date_time': f"{appt.date.strftime('%b %d, %Y')} - {appt.time_slot}",
            'student_name': appt.student.name,
            'topic': appt.purpose,
            'student_status': appt.student_status.capitalize(),
            'counselor_status': appt.counselor_status.capitalize(),
            'id': appt.id  
        }
        for appt in appointments
    ]
    counselor = Counselor.query.get_or_404(session['counselor_id'])
    profile_picture = counselor.profile_picture
    return render_template('counselor/coun_appointment.html',active_page='coun_appointment',appointments=appointment_list,profile_picture=profile_picture)

@app.route('/approve_appointment/<int:appointment_id>',methods=['POST'])
def approve_appointment(appointment_id):
    if 'counselor_id' and 'counselor_name' not in session:
        return redirect(url_for('coun_login'))
    
    appointment = Appointment.query.filter_by(id=appointment_id).first()

    if not appointment:
        return jsonify({'success': False, 'message': 'Appointment not found.'}), 404
    
    appointment.counselor_status = 'approved'
    appointment.student_status = 'upcoming'

    print(appointment.student_status)
    db.session.commit()
    update_appointments()

    return jsonify({'success': True, 'message': 'Appointment approved successfully.'}), 200

@app.route('/reject_appointment/<int:appointment_id>', methods=['POST'])
def reject_appointment(appointment_id):
    if 'counselor_id' not in session or 'counselor_name' not in session:
        return redirect(url_for('coun_login'))
    
    appointment = Appointment.query.filter_by(id=appointment_id).first()

    if not appointment:
        return jsonify({'success': False, 'message': 'Appointment not found.'}), 404

        
    appointment.counselor_status = 'rejected'
    appointment.student_status = 'canceled'

    db.session.commit()

    return jsonify({'success': True, 'message': 'Appointment rejected successfully.'}), 200

@app.route('/cancel_appointment/<int:appointment_id>', methods=['POST'])
def cancel_appointment(appointment_id):
    if 'counselor_id' not in session or 'counselor_name' not in session:
        return redirect(url_for('coun_login'))

    appointment = Appointment.query.filter_by(id=appointment_id).first()

    if not appointment:
        return jsonify({'success': False, 'message': 'Appointment not found.'}), 404

    # if appointment.counselor_status != 'Approved':
    #     print(f"Invalid status for cancellation: {appointment.counselor_status}")
    #     return jsonify({'success': False, 'message': 'Only approved appointments can be canceled.'}), 400

    appointment.counselor_status = 'canceled'
    appointment.student_status = 'none'
    db.session.commit()

    return jsonify({'success': True, 'message': 'Appointment canceled successfully.'}), 200

@app.route('/view_student_details/<int:appointment_id>', methods=['GET'])
def view_student_details(appointment_id):
    appointment = Appointment.query.filter_by(id=appointment_id).first()

    if appointment:
        student = appointment.student
        if student:
            student_details = {
                'success': True,
                'student_name': student.name,
                'email': student.email,
                'phone': student.contact_number,
                'interests': student.interests,
                'purpose': appointment.purpose,
                'status': appointment.student_status,
                'date': appointment.date.strftime('%Y-%m-%d'),
                'time_slot': appointment.time_slot,
            }
        else:
            student_details = {'success': False, 'message': 'Student details not found for this appointment'}
    else:
        student_details = {'success': False, 'message': 'Appointment not found'}

    return jsonify(student_details)



@app.route('/coun_view_stud')
def coun_view_stud():
    if 'counselor_id' not in session or 'counselor_name' not in session:
        return redirect(url_for('coun_login'))
    
    counselor_id = session['counselor_id']

    approved_appointments = (
        db.session.query(Appointment)
        .filter(Appointment.counselor_status == 'completed',
                Appointment.counselor_id == counselor_id
            )
        .all()
    )
    
    unique_students = {}
    for appointment in approved_appointments:
        student = appointment.student
        if student.id not in unique_students:
            unique_students[student.id] = {
                'student': student,
                'appointment_id': appointment.id,
                'session_count': sum(
                    1 for a in approved_appointments if a.student == student
                )
            }

    students_with_sessions = list(unique_students.values())

    counselor = Counselor.query.get_or_404(session['counselor_id'])
    profile_picture = counselor.profile_picture

    return render_template(
        'counselor/view_stud.html',
        active_page='coun_view_stud',
        students_with_sessions=students_with_sessions,
        profile_picture=profile_picture
    )

# @app.route('/get_messages',methods=['GET'])
# def get_messages(student_id):
#     if 'counselor_id' not in session:
#         return redirect(url_for('coun_login'))
    
#     counselor_id = session['counselor_id']
#     student= Student.query.get_or_404(student_id)

#     messages = Message.query.filter(
#         (Message.sender_id == counselor_id) & (Message.recipient_id == student_id) |
#         (Message.sender_id == student_id) & (Message.recipient_id == counselor_id)
#     ).order_by(Message.timestamp).all()

#     return render_template('counselor/coun_msg.html',active_page='coun_view_stud',student=student,messages=messages)

@app.route('/coun_room', methods=['GET'])
def coun_room():
    if request.method == 'GET':
        if 'counselor_id' not in session:
            return redirect(url_for('coun_login'))
    
    counselor_id = session['counselor_id'] 

    live_appointments = Appointment.query.filter_by(
    counselor_id=counselor_id,
    counselor_status='approved',
    student_status='live'
    ).all()

    counselor = Counselor.query.get_or_404(session['counselor_id'])
    profile_picture = counselor.profile_picture

    return render_template('counselor/coun_room.html', appointments=live_appointments,profile_picture=profile_picture,active_page='coun_room')



#this

@app.route('/start_meeting/<int:appointment_id>', methods=['GET'])
def start_meeting(appointment_id):
    try:
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return "Appointment not found.", 404

        if appointment.counselor_status != 'approved':
            return "Meeting not approved to start.", 400

        if not appointment.session_link:
            # room_details = create_daily_room()
            room_details = create_whereby_room()
            if not room_details:
                return "Failed to create meeting room.", 500

            appointment.session_link = room_details['roomUrl']
            appointment.student_status = 'upcoming'  
            db.session.commit()

        
        counselor = Counselor.query.get_or_404(session['counselor_id'])
        profile_picture = counselor.profile_picture

        return render_template(
            'counselor/start_meeting.html',
            session_link=appointment.session_link,
            student_name=appointment.student.name,
            appointment_id=appointment.id,  
            counselor_name=session['counselor_name'],
            profile_picture=profile_picture,
            active_page='coun_room'
        )
    except Exception as e:
        print(f"Error starting meeting: {e}")
        return "An error occurred while starting the meeting.", 500
    

@app.route('/update_meeting_status', methods=['POST'])
def update_meeting_status():
    try:
        data = request.json
        appointment_id = data.get('appointment_id')

        if not appointment_id:
            return {"message": "Appointment ID is missing."}, 400

        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return {"message": "Appointment not found."}, 404

        appointment.counselor_status = 'completed'
        appointment.student_status = 'completed'
        db.session.commit()

        # if counselor and student:
        #     counselor_activity(
        #         activity_type="Session Completed",
        #         activity_desc=f"Meeting with {student.name} on {appointment.date} at {appointment.time_slot} has been marked as completed.",
        #         created_by=counselor.full_name
        #     )

        return {"message": "Meeting status updated to completed."}, 200
    except Exception as e:
        print(f"Error updating meeting status: {e}")
        return {"message": "An error occurred while updating the meeting status."}, 500



# @app.route('/start_meeting/<int:appointment_id>', methods=['GET'])
# def start_meeting(appointment_id):
#     # Validate the appointment
#     appointment = Appointment.query.filter_by(
#         id=appointment_id,
#         counselor_id=session['counselor_id'],
#         counselor_status='approved',
#         student_status='live'
#     ).first()

#     if not appointment:
#         return redirect(url_for('coun_room'))

#     # Generate a unique room name
#     room_name = f"room_{appointment.student_id}_{appointment.counselor_id}_{appointment.id}"


#     # Pass the room name and student details to the template
#     return render_template(
#         'counselor/start_meeting.html',
#         room_name=room_name,
#         student=appointment.student,
#         counselor_name=session.get('counselor_name', 'Counselor')
#     )

# @app.route('/start_meeting/<int:appointment_id>', methods=['GET'])
# def start_meeting(appointment_id):
#     # Fetch the appointment using its ID
#     appointment = Appointment.query.get_or_404(appointment_id)
    
#     # Generate a full session link if it doesn't exist
#     if not appointment.session_link:
#         base_url = "https://meet.jit.si/"
#         appointment.session_link = f"{base_url}appointment_{appointment.id}"
#         db.session.commit()  # Save the updated session link in the database
    
#     # Render the meeting page with the session link
#     return render_template(
#         'counselor/start_meeting.html',
#         session_link=appointment.session_link
#     )



@app.route('/manage_resources',methods=['GET','POST'])
def manage_resources():
    if request.method == 'GET':
        if 'counselor_id' not in session:
            return redirect(url_for('coun_login'))
    
        counselor = Counselor.query.get_or_404(session['counselor_id'])
        profile_picture = counselor.profile_picture
        
        resources = Resource.query.filter_by(counselor_id=session['counselor_id']).all()
        return render_template('counselor/coun_resources.html',resources=resources,profile_picture=profile_picture,active_page='manage_resources')
    
    if request.method == 'POST':
        if 'file' not in request.files or 'title' not in request.form:
            return jsonify({'error':'Invalid Request!'}), 400
        
        title = request.form['title']
        file = request.files['file']
        category = request.form['category']
        description = request.form.get('description','No Description Provided')
        file_type = file.filename.split('.')[-1].upper()
        file_size = f"{round(len(file.read()) / 1024, 2)} KB"
        file.seek(0) 
        counselor_id = session.get('counselor_id')

        if not counselor_id:
            return jsonify({'error':'Unauthorized!'}), 403
        
        file_name = f"{title.replace(' ', '_').lower()}.{file_type}"
        file_path = f"static/resources/{file_name}"
        file.save(file_path)

        downloads = 0
        
        new_resource = Resource(
            title = title,
            category = category,
            description = description,
            file_type = file_type,
            file_size = file_size,
            file_link = file_path,
            downloads = downloads,
            counselor_id = counselor_id
        )

        db.session.add(new_resource)
        db.session.commit()
        return jsonify({
            'title': new_resource.title,
            'type': new_resource.file_type
        }), 200


@app.route('/get_resource/<int:resource_id>',methods=['GET'])
def get_resource(resource_id):
     resource = Resource.query.get(resource_id)
     if resource:
         return jsonify({
            'title': resource.title,
            'category': resource.category,
            'file_type': resource.file_type,
            'file_size': resource.file_size,
            'description': resource.description,
            'downloads': resource.downloads,
            'date_uploaded': resource.date_uploaded.strftime('%Y-%m-%d'),
        }), 200
     else:
         return jsonify({'error': 'Resource not found'}), 404
     
@app.route('/delete_resource/<int:resource_id>',methods=['DELETE'])
def delete_resource(resource_id):
    resource = Resource.query.get(resource_id)

    if not resource:
        return jsonify({'error':"Resource Not Found!"}), 404
    
    db.session.delete(resource)
    db.session.commit()
    return jsonify({'message':'Resource Deleted Successfully!'}), 200

@app.route('/coun_feedback')
def coun_feedback():
    if 'counselor_id' and 'counselor_name' not in session:
        return redirect(url_for('coun_login'))
    
    counselor_id = session['counselor_id']
    feedbacks = Feedback.query.filter_by(counselor_id=counselor_id).all()

    ratings = db.session.query(
        Feedback.rating,
        func.count(Feedback.rating).label('count')
    ).filter_by(counselor_id=counselor_id).group_by(Feedback.rating).all()

    total_ratings = sum(r[1] for r in ratings)
    overall_rating = (
        sum(r[0] * r[1] for r in ratings) / total_ratings if total_ratings > 0 else 0
    )

    rating_distribution = {star: 0 for star in range(1,6)}
    for r in ratings:
        rating_distribution[r[0]] = r[1]
    
    counselor = Counselor.query.get_or_404(session['counselor_id'])
    profile_picture = counselor.profile_picture
    return render_template('counselor/coun_feedback.html',active_page='coun_feedback',feedbacks=feedbacks,total_ratings=total_ratings,rating_distribution=rating_distribution,overall_rating=overall_rating,profile_picture=profile_picture)

@app.route('/counselor_feedback_chart/<int:counselor_id>', methods=['GET'])
def counselor_feedback_chart(counselor_id):
    try:
        # Fetch feedback ratings for a specific counselor
        feedback_data = db.session.query(
            Feedback.rating,
            func.count(Feedback.rating).label('rating_count')
        ).filter_by(counselor_id=counselor_id).group_by(Feedback.rating).all()

        # Prepare the data for the chart
        ratings = [1, 2, 3, 4, 5]  # Assuming ratings are from 1 to 5
        rating_counts = {rating: 0 for rating in ratings}

        # Populate the rating counts from the query result
        for feedback in feedback_data:
            rating_counts[feedback.rating] = feedback.rating_count

        chart_data = {
            'labels': ratings,           # Rating values (1 to 5 stars)
            'data': [rating_counts[rating] for rating in ratings]  # Rating counts
        }

        # Return the data in JSON format
        return jsonify(chart_data)

    except Exception as e:
        print(f"Error fetching counselor feedback: {e}")
        return jsonify({'message': 'Error fetching feedback data'}), 500



@app.route('/coun_profile')
def coun_profile():
    if 'counselor_id' not in session:
        return redirect(url_for('coun_login'))
    
    counselor_id = session['counselor_id']
    counselor_data = Counselor.query.get_or_404(counselor_id)

    try:
        interests = json.loads(counselor_data.interests) if counselor_data.interests else []
    except json.JSONDecodeError:
        interests = [counselor_data.interests] if counselor_data.interests else []

    total_sessions = Appointment.query.filter_by(counselor_id=counselor_id, counselor_status='completed').count()

    total_students = db.session.query(Appointment.student_id).filter_by(counselor_id=counselor_id).distinct().count()

    avg_rating = db.session.query(db.func.avg(Feedback.rating)).filter_by(counselor_id=counselor_id).scalar()
    avg_rating = round(avg_rating, 1) if avg_rating else "N/A"

    schedules = counselor_data.schedules


    schedule_dict = {}
    for schedule in schedules:
        day = schedule.day_of_week.capitalize()  
        start_time = schedule.time_slots.get("startTime", "N/A")
        end_time = schedule.time_slots.get("endTime", "N/A")
        schedule_dict[day] = f"{start_time} - {end_time}"

    return render_template(
        'counselor/coun_profile.html',
        active_page='coun_profile',
        counselor_data=counselor_data,
        schedule_dict=schedule_dict,
        total_sessions=total_sessions,
        total_students=total_students,
        avg_rating=avg_rating,
        interests=interests
    )

@app.route('/update_coun_profile', methods=['POST'])
def update_coun_profile():
    # Ensure you are receiving the form data correctly
    full_name = request.form.get('full_name')
    email = request.form.get('email')
    contact_number = request.form.get('contact_number')
    specialization = request.form.get('specialization')
    bio = request.form.get('bio')

    # Validate the form data
    if not full_name or not email or not contact_number or not specialization:
        return jsonify({"success": False, "message": "All fields are required."})

    # Perform the database update
    try:
        # Assuming you have a 'Counselor' model with an 'id' attribute to identify the counselor
        counselor = Counselor.query.filter_by(id=session['counselor_id']).first()
        counselor.full_name = full_name
        counselor.email = email
        counselor.contact_number = contact_number
        counselor.specialization = specialization
        counselor.bio = bio

        # Commit the changes to the database
        db.session.commit()

        return jsonify({"success": True})
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Failed to update profile."})

@app.route('/counselor_notifications', methods=['GET'])
def counselor_notifications():
    try:
        notifications = Notification.query.filter_by(
            recipients='counselors', status='sent'
        ).order_by(Notification.created_at.desc()).limit(3).all()

        notification_list = [
            {
                'id': notification.id,
                'title': notification.title,
                'message': notification.message,
                'created_at': notification.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'status': notification.status
            }
            for notification in notifications
        ]

    
        # counselor_activity(
        #         activity_type="Notification Received",
        #         activity_desc=f"New notifications received: {', '.join([n.title for n in notifications])}",
        #         created_by="System" 
        #     )

        return jsonify({'notifications': notification_list})
    
    except Exception as e:
        print(f"Error fetching notifications for counselors: {e}")
        return jsonify({'notifications': [], 'error': 'Failed to fetch notifications'}), 500



@app.route('/coun_logout')
def coun_logout():
    session.pop('counselor_name',None)
    session.pop('counselor_id',None)
    return redirect(url_for('coun_login'))



# =============================================================================================== #
# ------------------------------------Landing Page Panel----------------------------------------- #
# =============================================================================================== #

@app.route('/')
def home():
    return render_template('landing_page/landing_page.html')

@app.route('/about')
def about():
    return render_template('landing_page/about.html')

@app.route('/counselor')
def counselor():
    return render_template('landing_page/counselor.html')

@app.route('/student')
def student():
    return render_template('landing_page/student.html')

@app.route('/services')
def services():
    return render_template('landing_page/services.html')

@app.route('/faq')
def faq():
    return render_template('landing_page/faq.html')

@app.route('/contact')
def contact():
    return render_template('landing_page/contact.html')

@app.route('/meeting')
def meeting():
    return render_template('landing_page/meeting-card.html')

@app.route('/meeting-room')
def meeting_room():
    return render_template('landing_page/meeting.html')

@app.route('/meeting-join')
def meeting_join():
    return render_template('landing_page/meeting-join.html')

@app.route('/payment')
def payment_page():
    # Remove strict login check, but store login status
    is_logged_in = 'student_name' in session
    student_name = session.get('student_name', None)
    
    package = request.args.get('package', 'premium')
    cancelled = request.args.get('cancelled', 'false')
    error = request.args.get('error', 'false')
    
    # Package details for display
    package_details = {
        'basic': {
            'name': 'Basic Plan',
            'price': '$49/month',
            'features': [
                '1 Career Counseling Session',
                'Resume Review',
                'Access to Webinar Library',
                'Basic Resource Access'
            ]
        },
        'premium': {
            'name': 'Premium Plan',
            'price': '$99/month',
            'features': [
                '3 Career Counseling Sessions',
                'Resume & Cover Letter Review',
                'Access to All Webinars',
                'Full Resource Access',
                '1 Mock Interview',
                'Mentorship Matching'
            ]
        },
        'ultimate': {
            'name': 'Ultimate Plan',
            'price': '$149/month',
            'features': [
                'Unlimited Career Counseling',
                'Priority Resume & Cover Letter Review',
                'VIP Access to All Events',
                'Premium Resource Access',
                'Unlimited Mock Interviews',
                'Priority Mentorship Matching',
                'Mental Health Support Sessions'
            ]
        }
    }
    
    return render_template('student/payment.html', 
                          active_page='payment',
                          package=package,
                          package_details=package_details[package],
                          is_logged_in=is_logged_in,
                          student_name=student_name,
                          cancelled=cancelled,
                          error=error)

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        # Get the package from the form data
        package = request.form.get('package', 'premium')
        
        # Define package prices and details
        package_details = {
            'basic': {
                'name': 'Basic Plan',
                'price': 4900,  # $49.00
                'description': 'Basic career counseling services'
            },
            'premium': {
                'name': 'Premium Plan',
                'price': 9900,  # $99.00
                'description': 'Enhanced career counseling services'
            },
            'ultimate': {
                'name': 'Ultimate Plan',
                'price': 14900,  # $149.00
                'description': 'Comprehensive career counseling services'
            }
        }
        
        if package not in package_details:
            return "Invalid package selected", 400
        
        # Create Checkout Session - direct to payment without login check
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": package_details[package]['name'],
                            "description": package_details[package]['description']
                        },
                        "unit_amount": package_details[package]['price'],
                    },
                    "quantity": 1,
                },
            ],
            mode="payment",
            success_url=url_for('payment_success', _external=True) + "?session_id={CHECKOUT_SESSION_ID}&package=" + package,
            cancel_url=url_for('payment_failed', _external=True) + "?package=" + package + "&status=cancelled",
            metadata={
                'package': package
            }
        )
        
        # Record in database if user is logged in
        if 'student_name' in session:
            student = Student.query.filter_by(name=session.get('student_name')).first()
            if student:
                payment = Payment(
                    payment_intent_id=checkout_session.id,
                    amount=package_details[package]['price'],
                    currency='usd',
                    status='pending',
                    student_id=student.id,
                    payment_metadata={"package": package}
                )
                db.session.add(payment)
                db.session.commit()
        
        # Redirect to Stripe Checkout
        return redirect(checkout_session.url)
    
    except Exception as e:
        print(f"Error creating checkout session: {str(e)}")
        return redirect(url_for('payment_failed') + "?package=" + package + "&status=error")

@app.route('/payment_success')
def payment_success():
    session_id = request.args.get('session_id')
    package = request.args.get('package', 'premium')
    
    if not session_id:
        return redirect(url_for('services'))
    
    try:
        # Retrieve the session
        checkout_session = stripe.checkout.Session.retrieve(session_id)
        
        # Update payment status in database if user is logged in
        if 'student_name' in session:
            payment = Payment.query.filter_by(payment_intent_id=session_id).first()
            if payment:
                payment.status = 'completed'
                db.session.commit()
        
        return render_template('student/payment_success.html', 
                              package=package,
                              session_id=session_id)
    
    except Exception as e:
        print(f"Error retrieving checkout session: {str(e)}")
        return redirect(url_for('payment_failed') + f"?package={package}&status=error")

@app.route('/stripe-webhook', methods=['POST'])
def stripe_webhook():
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, "whsec_6CsI5M3qA9g5bK9YM1Eq9ctXvKLwnVQz"
        )
    except ValueError as e:
        # Invalid payload
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return jsonify({'error': 'Invalid signature'}), 400

    # Handle the events
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        print(f"PaymentIntent {payment_intent['id']} succeeded")
        
        # Find the payment record in our database
        payment = Payment.query.filter_by(payment_intent_id=payment_intent['id']).first()
        if payment:
            payment.status = 'completed'
            db.session.commit()

            # Send confirmation email to customer
            try:
                student = Student.query.get(payment.student_id)
                if student and student.email:
                    msg = Message(
                        'Payment Confirmation - Career Navigator',
                        sender=app.config['MAIL_USERNAME'],
                        recipients=[student.email]
                    )
                    
                    # Get package information from metadata
                    package = "premium"
                    if payment.payment_metadata and isinstance(payment.payment_metadata, dict):
                        package = payment.payment_metadata.get('package', 'premium')
                    
                    msg.body = f"""
                    Dear {student.name},

                    Thank you for subscribing to our {package.title()} plan!

                    Your payment of ${payment.amount/100:.2f} has been successfully processed.
                    
                    Transaction ID: {payment_intent['id']}

                    Best regards,
                    Career Navigator Team
                    """
                    mail.send(msg)
            except Exception as e:
                print(f"Error sending confirmation email: {str(e)}")

    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        error_message = payment_intent['last_payment_error']['message'] if payment_intent.get('last_payment_error') else None
        print(f"Payment failed: {payment_intent['id']}, {error_message}")
        
        # Update payment status in database
        payment = Payment.query.filter_by(payment_intent_id=payment_intent['id']).first()
        if payment:
            payment.status = 'failed'
            db.session.commit()

    return jsonify({'status': 'success'})

# @app.route('/test_razorpay')
# def test_razorpay():
#     try:
#         # Test API call
#         razorpay_client.payment.all()
#         return jsonify({'status': 'success', 'message': 'Razorpay connection successful'})
#     except Exception as e:
#         return jsonify({'status': 'error', 'message': str(e)})

@app.route('/payment_failed')
def payment_failed():
    # Remove login check to prevent redirection
    # if 'student_name' not in session:
    #     return redirect(url_for('student_login'))
    
    package = request.args.get('package', 'premium')
    status = request.args.get('status', 'failed')
    error = request.args.get('error', 'false')
    
    return render_template('student/payment_failed.html', 
                          package=package,
                          status=status,
                          error=error)




@app.route('/create-razorpay-order', methods=['POST'])
def create_razorpay_order():
    try:
        data = request.get_json()
        amount = data.get('amount')  # amount in paise

        # Create Razorpay Order
        order_data = {
            'amount': amount,
            'currency': 'INR',
            'receipt': f'order_rcptid_{int(time.time())}',
            'payment_capture': 1  # auto capture
        }
        
        order = razorpay_client.order.create(data=order_data)
        
        return jsonify({
            'success': True,
            'order_id': order['id']
        })

    except Exception as e:
        print(f"Error creating order: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create order'
        }), 500

@app.route('/verify-razorpay-payment', methods=['POST'])
def verify_razorpay_payment():
    try:
        data = request.get_json()
        
        # Verify signature
        params_dict = {
            'razorpay_payment_id': data.get('razorpay_payment_id'),
            'razorpay_order_id': data.get('razorpay_order_id'),
            'razorpay_signature': data.get('razorpay_signature')
        }
        
        # Verify signature
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # Get appointment data
        appointment_data = data.get('appointment_data')
        
        # Save appointment to database
        appointment = Appointment(
            student_id=session.get('student_id'),
            counselor_id=appointment_data.get('counselor_id'),
            appointment_date=appointment_data.get('appointment_date'),
            time_slot=appointment_data.get('time_slot'),
            purpose=appointment_data.get('purpose'),
            plan=appointment_data.get('plan'),
            amount=appointment_data.get('amount'),
            payment_id=data.get('razorpay_payment_id'),
            order_id=data.get('razorpay_order_id'),
            status='confirmed'
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Payment verified and appointment created'
        })

    except Exception as e:
        print(f"Error verifying payment: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Payment verification failed'
        }), 400



if __name__ == '__main__':
    app.run(debug=True)
