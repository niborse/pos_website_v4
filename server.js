const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Configure Nodemailer transporter for Hotmail
const transporter = console.log(nodemailer.createTransport)({
    service: 'hotmail',
    auth: {
      user: 'nvborse121@hotmail.com',
      pass: 'JOKER123'
    },
    debug: true // Enable debug logging
  });

// Endpoint to send email notifications
app.post('/send-email', (req, res) => {
  const { item, quantity, status } = req.body;

  const mailOptions = {
    from: 'nvborse121@hotmail.com',
    to: 'nvborse1812@gmail.com', // Replace with the recipient's email address
    subject: `Inventory Alert: ${item}`,
    text: `The stock for ${item} is ${status} with only ${quantity} items left.`
  };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send('Error sending email: ' + error.message);
        }
        console.log('Email sent:', info.response);
        res.status(200).send('Email sent successfully');
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
