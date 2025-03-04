@App.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Missing data'}), 400

    if username in users_db:
        return jsonify({'error': 'Username already exists'}), 409

    # Further validations can be added here

    users_db[username] = {
        'email': email,
        'password': password  # Remember to hash passwords in a real application
    }
    return jsonify({'message': 'User registered successfully'}), 201
