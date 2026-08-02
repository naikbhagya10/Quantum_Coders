import json
import urllib.request
import urllib.error

base = 'http://localhost:5001/api'
user = {
    'name': 'Test User',
    'email': 'testuser@example.com',
    'password': 'TestPass123',
    'age': 30,
    'gender': 'Other',
    'blood_group': 'O+'
}

req = urllib.request.Request(base + '/auth/register', data=json.dumps(user).encode(), headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as r:
        print('REGISTER', r.status, r.read().decode())
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print('REGISTER ERR', e.code, body)
    if e.code != 409:
        raise

cred = json.dumps({'email': 'testuser@example.com', 'password': 'TestPass123'}).encode()
req = urllib.request.Request(base + '/auth/login', data=cred, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as r:
    body = json.loads(r.read().decode())
    print('LOGIN', r.status, body)
    token = body['token']

appt = {
    'doctor_name': 'Dr. Smith',
    'specialty': 'Cardiology',
    'facility_name': 'City Care Hospital',
    'appointment_date': '2026-08-10',
    'appointment_time': '10:30 AM',
    'reason': 'Follow up',
    'reminder_minutes_before': 1440
}
req = urllib.request.Request(
    base + '/appointments',
    data=json.dumps(appt).encode(),
    headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}
)
with urllib.request.urlopen(req) as r:
    print('APPT', r.status, r.read().decode())

req = urllib.request.Request(base + '/appointments', headers={'Authorization': f'Bearer {token}'})
with urllib.request.urlopen(req) as r:
    print('GET APPTS', r.status, r.read().decode())
