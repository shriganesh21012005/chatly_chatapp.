import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();


const __dirname = path.resolve();
// const app = express(); 




// app.use(express.json());
// app.use(express.urlencoded({ extended: true}));
// 



// const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));// This will prevent PayloadTooLargeError(This means request of size upto 10mb can come from the frontend)
app.use(cors({
  origin:"https://chatly-black-one.vercel.app", credentials: true
}));

// This will allow these frontends to talk to our backend with credentials..and will also allow cookies to be received by this very frontends in case my backend is running on some diffrent domain or https.
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.use("/", (req, res) => {
  res.send("API is running...");//This should be at the last route...otherwise other routes below this won't work.
});




// if (ENV.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/Chatly/dist")));

//   app.get("*", (_, res) => {
//     res.sendFile(
//       path.join(__dirname, "../frontend/Chatly/dist/index.html")
//     );
//   });
// }



server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
