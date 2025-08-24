const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let conn = null;
async function connectToDatabase() {
  if (conn == null) {
    conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  return conn;
}

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

exports.handler = async function(event, context) {
  await connectToDatabase();

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { name, email, password } = JSON.parse(event.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User already exists' }),
      };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });

    return {
      statusCode: 201,
      body: JSON.stringify({ token, name: user.name }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
