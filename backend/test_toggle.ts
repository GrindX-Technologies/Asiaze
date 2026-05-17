const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  const testUser = new User({
    name: 'Test Toggle',
    email: 'testtoggle@example.com',
    password: 'password123',
    status: 'active',
  });
  await testUser.save();
  
  console.log('Created user');
  testUser.deviceToken = 'token123';
  await testUser.save();
  
  const fetched1 = await User.findById(testUser._id);
  console.log('Token1:', fetched1.deviceToken);
  
  fetched1.deviceToken = '';
  await fetched1.save();
  
  const fetched2 = await User.findById(testUser._id);
  console.log('Token2:', fetched2.deviceToken);
  
  await User.findByIdAndDelete(testUser._id);
  await mongoose.disconnect();
}
run();