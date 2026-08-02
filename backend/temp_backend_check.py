import requests

base = 'http://127.0.0.1:5001/api'
print('health', requests.get(base + '/health').status_code)
email = 'testuser-copilot@example.com'
payload = {
    'name': 'Test User',
    'email': email,
    'password': 'Password123',
    'age': 30,
    'gender': 'Male',
    'blood_group': 'A+'
}
resp = requests.post(base + '/auth/register', json=payload)
print('register', resp.status_code, resp.text)
if resp.status_code != 201:
    auth_resp = requests.post(base + '/auth/login', json={'email': email, 'password': 'Password123'})
    print('login', auth_resp.status_code, auth_resp.text)
    token = auth_resp.json().get('token') if auth_resp.ok else None
else:
    token = resp.json().get('token')
print('token', token)
if token:
    headers = {'Authorization': f'Bearer {token}'}
    sample = requests.post(base + '/reports/sample', headers=headers)
    print('sample', sample.status_code, sample.text)
    reports = requests.get(base + '/reports', headers=headers)
    print('reports', reports.status_code, reports.text)
