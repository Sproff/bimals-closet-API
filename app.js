const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const routeRouter = require('./routes/route');
const userRoute = require('./routes/user.route');
const { handleError } = require('./utils/errorHandler');
const port = process.env.PORT || 9000;

app.use(express.json());
app.use('/', routeRouter);
app.use('/user', userRoute);
app.use(handleError);

async function init() {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
  console.log('DB Connected Successfully');
}
init();
