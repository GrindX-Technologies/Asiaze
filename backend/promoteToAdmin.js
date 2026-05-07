const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/asiaze")
  .then(async () => {
    console.log("Connected to DB");
    // We update all users or just the most recent one
    const result = await mongoose.connection.collection('users').updateMany({}, { $set: { role: 'admin' } });
    console.log("Promoted all users to admin: ", result);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
