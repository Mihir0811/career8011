import os

import razorpay
import razorpay

class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///careernavigator.db'    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', os.urandom(24))
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', 'careernavigator20@gmail.com')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', 'sogi qsrt ockx uomu')
    # DAILY_API_URL = "https://api.daily.co/v1/rooms"
    # DAILY_API_KEY = "125f43818b58a38b664cf652b9b978115e7441d4367aee99777f4f2e131d7f36"
    # WHEREBY_API_URL = "https://api.whereby.dev/v1/meetings"
    # WHEREBY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmFwcGVhci5pbiIsImF1ZCI6Imh0dHBzOi8vYXBpLmFwcGVhci5pbi92MSIsImV4cCI6OTAwNzE5OTI1NDc0MDk5MSwiaWF0IjoxNzQ0MDM1MDIzLCJvcmdhbml6YXRpb25JZCI6MzEzNzkyLCJqdGkiOiJiZDA5YzY0YS04Y2NjLTQ1MjEtOTM4YS00Mzg5MjgwZjMzZWYifQ.nNe0sMP1kkPeLlDUA4x7v42ycT00V1lBSCuGzQyLSus"
    RAZORPAY_KEY_ID = 'rzp_test_1DP5mmOlF5G5ag'  # Test Key
    RAZORPAY_KEY_SECRET = 'thisFPVNwAHb44dkixvH2Nw'  # Test Secret
    STRIPE_PUBLISHABLE_KEY = 'pk_test_51R2sFf4DuQBaqDtlKmdq4qlXcReHYqaAFDD5gNzT41gg5Jl5y51KIqbAwS0uLByeFdwc55RO7o6WlkjRRRXHnBP700Gnq5NGkt'
    STRIPE_SECRET_KEY = 'sk_test_51R2sFf4DuQBaqDtl71gUnux6EbAe6Sg8Mo7m0QEshvpAPI5RB7LDodbVDN1Oj01pJBtPd3koeFa9Xa28J6rN1AJT00WwzlcMNx'
    STRIPE_WEBHOOK_SECRET = 'whsec_6CsI5M3qA9g5bK9YM1Eq9ctXvKLwnVQz'

razorpay_client = razorpay.Client(auth=(Config.RAZORPAY_KEY_ID, Config.RAZORPAY_KEY_SECRET))
