import express from 'express';
const app = express();

app.get('/api/test', (req, res) => {
  res.send('Test OK');
});

app.listen(3000, () => console.log('Running on port 3000'));
