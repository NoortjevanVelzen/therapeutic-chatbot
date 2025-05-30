const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const openaiRoutes = require('./routes/openai');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', openaiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`OpenAI backend running on port ${PORT}`);
});