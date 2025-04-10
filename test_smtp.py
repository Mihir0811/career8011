import smtplib

server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()
try:
    server.login('careernavigator20@gmail.com', 'sogi qsrt ockx uomu')
    print("Logged in successfully.")
    server.quit()
except Exception as e:
    print(f"Failed to login: {str(e)}")
