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

function verifyToken(token) {
  try {
    return jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'fallback_secret');
  } catch (error) {
    return null;
  }
}

exports.handler = async function(event, context) {
  await connectToDatabase();

  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const token = event.headers['authorization'] || event.headers['Authorization'];
  const payload = verifyToken(token);
  if (!payload) {
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    const { password } = JSON.parse(event.body);
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(payload.userId, { password: hashedPassword });
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({ message: 'Password updated successfully' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
