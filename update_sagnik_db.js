const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/asiaze';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const result = await usersCollection.updateOne(
      { email: 'sagnik.sagnik.sen2004@gmail.com' },
      { $set: { role: 'user' } }
    );

    console.log('Update result:', result);
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

connectDB();