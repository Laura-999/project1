const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const mongoUrl = 'mongodb://127.0.0.1:27017';
const dbName = 'mydatabase';

// Function to insert a new signup document in the database
async function insertSignupData(data) {
  const client = new MongoClient(mongoUrl);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('signup');
    await collection.insertOne(data);
  } catch (err) {
    console.error('Error inserting signup data:', err);
  } finally {
    await client.close();
  }
}

const server = http.createServer((req, res) => {
  // Route for the signup page
  if (req.url === '/signup' && req.method === 'GET') {
    const filePath = path.join(__dirname, 'signup.html');
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  }

  // Route for processing the signup form
  if (req.url === '/signup' && req.method === 'POST') {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      const formData = new URLSearchParams(data);
      const name = formData.get('name');
      const email = formData.get('email');
      const password = formData.get('password');
      const signupData = { name, email, password };

      // Store signup data in MongoDB
      insertSignupData(signupData);

      // Redirect the user to a success page
      res.writeHead(302, { Location: '/signup-success.html' });
      res.end();
    });
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
