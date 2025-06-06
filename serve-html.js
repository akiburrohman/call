const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname)));

app.listen(5500, () => {
  console.log('HTML server running at http://localhost:5500');
});
