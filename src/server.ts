import connect from "./conect";
import createApp from "./app";
import dotenv from 'dotenv';
dotenv.config();


const app = createApp();

connect();

// START SERVER
app.listen(3000, () => {
  console.log("Server listening to port 3000.");
});

