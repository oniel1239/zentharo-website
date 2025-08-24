const mongoose = require('mongoose');
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
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const token = event.headers['authorization'] || event.headers['Authorization'];
  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Access denied' })
    };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid token' })
    };
  }

  try {
    const { name } = JSON.parse(event.body);
    const user = await User.findByIdAndUpdate(decoded.userId, { name }, { new: true });
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ name: user.name })
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
};
