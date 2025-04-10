import os
import sys
import subprocess
import pkg_resources
from pkg_resources import DistributionNotFound, VersionConflict
import venv
import platform
import signal
import json

# Define colors for console output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

# Handle Ctrl+C gracefully
def signal_handler(sig, frame):
    print(f"\n{Colors.WARNING}Setup interrupted by user. Exiting...{Colors.ENDC}")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

# Project title
project_title = """
 ██████╗ █████╗ ██████╗ ███████╗███████╗██████╗     ███╗   ██╗ █████╗ ██╗   ██╗██╗ ██████╗  █████╗ ████████╗ ██████╗ ██████╗ 
██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗    ████╗  ██║██╔══██╗██║   ██║██║██╔════╝ ██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗
██║     ███████║██████╔╝█████╗  █████╗  ██████╔╝    ██╔██╗ ██║███████║██║   ██║██║██║  ███╗███████║   ██║   ██║   ██║██████╔╝
██║     ██╔══██║██╔══██╗██╔══╝  ██╔══╝  ██╔══██╗    ██║╚██╗██║██╔══██║╚██╗ ██╔╝██║██║   ██║██╔══██║   ██║   ██║   ██║██╔══██╗
╚██████╗██║  ██║██║  ██║███████╗███████╗██║  ██║    ██║ ╚████║██║  ██║ ╚████╔╝ ██║╚██████╔╝██║  ██║   ██║   ╚██████╔╝██║  ██║
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═══╝╚═╝  ╚═╝  ╚═══╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
"""

requirements = [
    'flask',
    'flask-cors',
    'flask-sqlalchemy',
    'flask-migrate',
    'flask-mail',
    'apscheduler',
    'razorpay',
    'stripe',
    'sqlalchemy',
    'python-dotenv',
]

directory_structure = [
    'instance',
    'static/resources',
    'static/img/coun_uploads',
    'static/js',
    'static/css',
    'templates/landing_page',
    'templates/counselor',
    'templates/admin',
    'templates/student',
]

def print_step(step_number, message):
    """Print a formatted step message"""
    print(f"\n{Colors.BLUE}[Step {step_number}]{Colors.ENDC} {Colors.BOLD}{message}{Colors.ENDC}")

def print_success(message):
    """Print a success message"""
    print(f"{Colors.GREEN}✓ {message}{Colors.ENDC}")

def print_error(message):
    """Print an error message"""
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}")

def print_warning(message):
    """Print a warning message"""
    print(f"{Colors.WARNING}! {message}{Colors.ENDC}")

def check_python_version():
    """Check if Python version is compatible"""
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print_error("Python 3.8 or higher is required.")
        return False
    print_success(f"Python version {python_version.major}.{python_version.minor}.{python_version.micro} detected.")
    return True

def setup_virtual_environment():
    """Set up a virtual environment"""
    if os.path.exists("venv"):
        print_warning("Virtual environment already exists.")
        return True
    
    try:
        print("Creating virtual environment...")
        venv.create("venv", with_pip=True)
        print_success("Virtual environment created successfully.")
        return True
    except Exception as e:
        print_error(f"Failed to create virtual environment: {str(e)}")
        return False

def activate_virtual_environment():
    """Prepare the activation command for the virtual environment"""
    if sys.platform == "win32":
        activate_script = os.path.join("venv", "Scripts", "activate")
        activate_cmd = f"call {activate_script}"
    else:
        activate_script = os.path.join("venv", "bin", "activate")
        activate_cmd = f"source {activate_script}"
    
    print_warning(f"To activate the virtual environment, run: {activate_cmd}")
    print_warning("After setup completes, you'll need to activate it manually.")
    
    # Update Python executable path to use the virtual environment
    if sys.platform == "win32":
        return os.path.join(os.getcwd(), "venv", "Scripts", "python.exe")
    else:
        return os.path.join(os.getcwd(), "venv", "bin", "python")

def install_requirements(python_path):
    """Install required packages"""
    try:
        # Create requirements.txt
        with open("requirements.txt", "w") as f:
            f.write("\n".join(requirements))
        
        # Install dependencies
        print("Installing required packages...")
        if sys.platform == "win32":
            subprocess.check_call([python_path, "-m", "pip", "install", "-r", "requirements.txt"])
        else:
            subprocess.check_call([python_path, "-m", "pip", "install", "-r", "requirements.txt"])
        
        print_success("All required packages installed successfully.")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to install packages: {str(e)}")
        return False
    except Exception as e:
        print_error(f"An error occurred during package installation: {str(e)}")
        return False

def create_directories():
    """Create necessary directories if they don't exist"""
    try:
        for directory in directory_structure:
            if not os.path.exists(directory):
                os.makedirs(directory)
                print(f"Created directory: {directory}")
        print_success("All required directories have been created.")
        return True
    except Exception as e:
        print_error(f"Failed to create directories: {str(e)}")
        return False

def setup_environment_variables():
    """Create a .env file with necessary environment variables"""
    env_vars = {
        'SECRET_KEY': os.urandom(24).hex(),
        'MAIL_USERNAME': 'careernavigator20@gmail.com',
        'MAIL_PASSWORD': 'sogi qsrt ockx uomu',
        'STRIPE_SECRET_KEY': 'sk_test_51R2sFf4DuQBaqDtl71gUnux6EbAe6Sg8Mo7m0QEshvpAPI5RB7LDodbVDN1Oj01pJBtPd3koeFa9Xa28J6rN1AJT00WwzlcMNx',
        'STRIPE_PUBLISHABLE_KEY': 'pk_test_51R2sFf4DuQBaqDtlKmdq4qlXcReHYqaAFDD5gNzT41gg5Jl5y51KIqbAwS0uLByeFdwc55RO7o6WlkjRRRXHnBP700Gnq5NGkt',
        'STRIPE_WEBHOOK_SECRET': 'whsec_6CsI5M3qA9g5bK9YM1Eq9ctXvKLwnVQz',
        'RAZORPAY_KEY_ID': 'rzp_test_1DP5mmOlF5G5ag',
        'RAZORPAY_KEY_SECRET': 'thisFPVNwAHb44dkixvH2Nw',
    }
    
    # Create .env file
    try:
        with open('.env', 'w') as f:
            for key, value in env_vars.items():
                f.write(f"{key}={value}\n")
        print_success(".env file created with default values.")
        print_warning("Note: For production, replace the default values with actual credentials.")
        return True
    except Exception as e:
        print_error(f"Failed to create .env file: {str(e)}")
        return False

def check_database_exists():
    """Check if the database file exists"""
    if os.path.exists(os.path.join("instance", "careernavigator.db")):
        print_warning("Database file already exists. Would you like to recreate it? (y/n)")
        choice = input().lower()
        return choice != 'y'
    return False

def initialize_database(python_path):
    """Initialize the database"""
    try:
        print("Initializing database...")
        subprocess.check_call([python_path, "init_db.py"])
        print_success("Database initialized successfully.")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to initialize database: {str(e)}")
        return False

def create_sample_data(python_path):
    """Create sample data in the database"""
    try:
        # Create interests.py file with sample data
        sample_interests = """
from app import app, db
from model import Interest

interests = [
    {"interest_name": "Web Development", "category": "Technology"},
    {"interest_name": "Mobile Development", "category": "Technology"},
    {"interest_name": "Data Science", "category": "Technology"},
    {"interest_name": "Artificial Intelligence", "category": "Technology"},
    {"interest_name": "Marketing", "category": "Business"},
    {"interest_name": "Finance", "category": "Business"},
    {"interest_name": "Human Resources", "category": "Business"},
    {"interest_name": "Graphic Design", "category": "Arts"},
    {"interest_name": "Writing", "category": "Arts"},
    {"interest_name": "Music", "category": "Arts"},
    {"interest_name": "Medicine", "category": "Healthcare"},
    {"interest_name": "Nursing", "category": "Healthcare"},
    {"interest_name": "Psychology", "category": "Social Sciences"},
    {"interest_name": "Education", "category": "Social Sciences"},
]

def create_interests():
    with app.app_context():
        for interest_data in interests:
            interest = Interest(**interest_data)
            db.session.add(interest)
        db.session.commit()
        print("Sample interests created successfully.")

if __name__ == "__main__":
    create_interests()
"""
        with open("sample_data.py", "w") as f:
            f.write(sample_interests)
        
        # Run the script
        print("Creating sample data...")
        subprocess.check_call([python_path, "sample_data.py"])
        print_success("Sample data created successfully.")
        return True
    except Exception as e:
        print_error(f"Failed to create sample data: {str(e)}")
        return False

def test_email_configuration(python_path):
    """Test email configuration"""
    try:
        print("Testing email configuration...")
        result = subprocess.run([python_path, "test_smtp.py"], capture_output=True, text=True)
        if "Logged in successfully" in result.stdout:
            print_success("Email configuration tested successfully.")
            return True
        else:
            print_error(f"Email test failed: {result.stdout}")
            return False
    except Exception as e:
        print_error(f"Failed to test email configuration: {str(e)}")
        return False

def create_run_script():
    """Create a simple run script"""
    if sys.platform == "win32":
        with open("run.bat", "w") as f:
            f.write("""@echo off
call venv\\Scripts\\activate
python app.py
""")
        print_success("Created run.bat script.")
    else:
        with open("run.sh", "w") as f:
            f.write("""#!/bin/bash
source venv/bin/activate
python app.py
""")
        # Make the script executable
        os.chmod("run.sh", 0o755)
        print_success("Created run.sh script.")

def main():
    """Main setup function"""
    print(Colors.HEADER + project_title + Colors.ENDC)
    print(f"{Colors.BOLD}Career Navigator - Setup Utility{Colors.ENDC}")
    print("This script will set up everything you need to run the Career Navigator web application.")
    
    # Step 1: Check Python version
    print_step(1, "Checking Python version")
    if not check_python_version():
        sys.exit(1)
    
    # Step 2: Set up virtual environment
    print_step(2, "Setting up virtual environment")
    if not setup_virtual_environment():
        sys.exit(1)
    
    # Get path to virtual environment Python
    python_path = activate_virtual_environment()
    
    # Step 3: Install requirements
    print_step(3, "Installing required packages")
    if not install_requirements(python_path):
        sys.exit(1)
    
    # Step 4: Create necessary directories
    print_step(4, "Creating directory structure")
    if not create_directories():
        sys.exit(1)
    
    # Step 5: Set up environment variables
    print_step(5, "Setting up environment variables")
    if not setup_environment_variables():
        sys.exit(1)
    
    # Step 6: Initialize database
    print_step(6, "Initializing database")
    db_exists = check_database_exists()
    if not db_exists:
        if not initialize_database(python_path):
            sys.exit(1)
        
        # Step 7: Create sample data (optional)
        print_step(7, "Creating sample data")
        create_sample_data(python_path)
    
    # Step 8: Test email configuration
    print_step(8, "Testing email configuration")
    test_email_configuration(python_path)
    
    # Step 9: Create run script
    print_step(9, "Creating run script")
    create_run_script()
    
    # Done!
    print(f"\n{Colors.GREEN}{Colors.BOLD}Career Navigator setup completed successfully!{Colors.ENDC}")
    
    # Instructions
    if sys.platform == "win32":
        print("\nTo run the application:")
        print(f"  1. {Colors.BOLD}run.bat{Colors.ENDC}")
        print("  or")
        print(f"  1. {Colors.BOLD}call venv\\Scripts\\activate{Colors.ENDC}")
        print(f"  2. {Colors.BOLD}python app.py{Colors.ENDC}")
    else:
        print("\nTo run the application:")
        print(f"  1. {Colors.BOLD}./run.sh{Colors.ENDC}")
        print("  or")
        print(f"  1. {Colors.BOLD}source venv/bin/activate{Colors.ENDC}")
        print(f"  2. {Colors.BOLD}python app.py{Colors.ENDC}")
    
    print(f"\nThen visit: {Colors.BOLD}http://127.0.0.1:5000/{Colors.ENDC} in your browser.")
    print(f"\n{Colors.BLUE}Happy coding!{Colors.ENDC}")

if __name__ == "__main__":
    main()