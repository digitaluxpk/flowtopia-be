const express = require('express');
const app = express();
require('dotenv').config();

const cors = require('cors');
const { connectToMongoDB } = require('./database/db');
const userRoutes = require('./routes/userRoutes');
app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectToMongoDB();

// Routes
app.use('/api/user', userRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
