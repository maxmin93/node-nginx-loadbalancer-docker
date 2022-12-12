const express = require('express');
const { createClient } = require("redis");

const redisClient = createClient({url: process.env.REDIS_URL});
redisClient.on('connect', () =>{
  console.log(`Connected to ${process.env.REDIS_URL}`);
});
redisClient.on("error", (error) => console.error(`redis> ${error}`));


const app = express();

app.get('/', async (req, res) => {
  if (redisClient.isOpen) {    
    let numVisits = await redisClient.get('numVisits');
    numVisitsToDisplay = parseInt(numVisits) + 1;
    if (isNaN(numVisitsToDisplay)) {
      numVisitsToDisplay = 1;
    }
    res.send('WEB2: Total number of visits is: '+numVisitsToDisplay);

    numVisits++;
    await redisClient.set('numVisits', numVisits);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async function() {
    console.log(`Web app is listening on port ${PORT}`);
    await redisClient.connect();  // Redis 연결
    await redisClient.del('numVisits');  // 초기화
});