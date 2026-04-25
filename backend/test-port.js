const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('PORT 5000 IS WORKING'));
app.listen(5000, () => console.log('Minimal server on 5000'));
