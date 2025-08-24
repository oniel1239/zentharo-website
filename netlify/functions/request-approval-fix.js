
const mongoose = require('mongoose');

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

const requestSchema = new mongoose.Schema({
  customerDetails: {
    name: String,
    email: String,
    phone: String
  },
  selectedServices: [String],
  status: { type: String, default: 'Pending' },
  submittedDate: String,
  submittedDateTime: String,
  submittedTimestamp: Number
});
const Request = mongoose.models.Request || mongoose.model('Request', requestSchema);

exports.handler = async function(event, context) {
  await connectToDatabase();

  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      const request = new Request(data);
      await request.save();
      return {
        statusCode: 201,
        body: JSON.stringify(request)
      };
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  if (event.httpMethod === 'GET') {
    try {
      const requests = await Request.find().sort({ submittedTimestamp: -1 });
      return {
        statusCode: 200,
        body: JSON.stringify(requests)
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method Not Allowed' })
  };
};
