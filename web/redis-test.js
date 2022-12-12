const { createClient } = require("redis");

const redisClient = createClient({
    url: "redis://minubt"
});
redisClient.on('connect', () => console.log('Connected to REDIS!'));
redisClient.on("error", (error) => console.error(`redis> ${error}`));

// 연결
(async () => {
  await redisClient.connect();
  console.log("HEAD")
})();

(async () => {
  setTimeout(()=>{
    console.log("sleep 1 sec");
  }, 1000);
  console.log("BODY")
})();

// 해제
(async () => {
  await redisClient.disconnect();
  console.log("TAIL")
})();
