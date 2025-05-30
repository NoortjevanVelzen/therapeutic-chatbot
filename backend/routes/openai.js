const express = require('express');
const router = express.Router();
const {
  chatWithOpenAI,
  extractMood,
  generateImage
} = require('../controllers/openaiController');

router.post('/chat', chatWithOpenAI);
router.post('/mood', extractMood);
router.post('/generate-image', generateImage);

module.exports = router;