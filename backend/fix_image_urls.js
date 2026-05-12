const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const dbUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/asiaze';

mongoose.connect(dbUrl).then(async () => {
  console.log('Connected to DB');
  
  const News = mongoose.connection.collection('news');
  const Categories = mongoose.connection.collection('categories');
  const Uploads = mongoose.connection.collection('uploads');
  
  const newsCursor = News.find({ coverImage: { $regex: '^/uploads/' } });
  let updatedNews = 0;
  for await (const doc of newsCursor) {
    const newUrl = '/api' + doc.coverImage;
    await News.updateOne({ _id: doc._id }, { $set: { coverImage: newUrl } });
    updatedNews++;
  }
  
  const catsCursor = Categories.find({ image: { $regex: '^/uploads/' } });
  let updatedCats = 0;
  for await (const doc of catsCursor) {
    const newUrl = '/api' + doc.image;
    await Categories.updateOne({ _id: doc._id }, { $set: { image: newUrl } });
    updatedCats++;
  }

  const upCursor = Uploads.find({ fileUrl: { $regex: '^/uploads/' } });
  let updatedUps = 0;
  for await (const doc of upCursor) {
    const newUrl = '/api' + doc.fileUrl;
    await Uploads.updateOne({ _id: doc._id }, { $set: { fileUrl: newUrl } });
    updatedUps++;
  }

  console.log(`Updated ${updatedNews} news, ${updatedCats} categories, ${updatedUps} uploads`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
