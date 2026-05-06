const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb://localhost:27017/asiaze';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const adminExists = await usersCollection.findOne({ email: 'asiaze2025@gmail.com' });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Asiaze@2026', salt);

      await usersCollection.insertOne({
        name: 'Admin User',
        email: 'asiaze2025@gmail.com',
        password: hashedPassword,
        role: 'admin',
        referralId: 'ADMIN123',
        points: 0,
        isBlocked: false,
        loginHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user already exists.');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

connectDB();
