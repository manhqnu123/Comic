import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {createServer} from "http";
dotenv.config();

import { connectDB } from "./config/db.js";
import cors from "cors"; // hoặc: const cors = require("cors");
import genresRouter from "./routers/genresRoutes.js";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";
import historyRouter from "./routers/historyRouter.js";
import comicRouter from "./routers/comicRouter.js";
import chapterRouter from "./routers/chapterRouter.js";
import commentRouter from "./routers/commentRouter.js";
import followRouter from "./routers/followRouter.js";
import path from "path";
import './model/index.js';
import { initPermissionsCache } from "./controllers/";
import permissionsRouter from "./routers/permissionsRouter.js";
import roleRouter from "./routers/roleRouter.js";
import { initSocket } from "./config/socketIO.js";

const __dirname = path.resolve();

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

if (process.env.NODE_ENV == "production") {
  app.use(
    cors({
      origin: "http://localhost:5173", // địa chỉ frontend
      credentials: true, // nếu dùng cookie/token
    }),
  );
}
app.use(express.json());
app.use(cookieParser());

app.use("/api/genres", genresRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/history", historyRouter);
app.use("/api/comics", comicRouter);
app.use("/api/chapters", chapterRouter);
app.use("/api/comments", commentRouter);
app.use("/api/follow", followRouter);
app.use("/api/permissions", permissionsRouter);
app.use("/api/roles", roleRouter);
app.use(express.static(path.join(__dirname, "../frontend/dist")));

if (process.env.NODE_ENV === "production") {
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

connectDB().then(() => {
  httpServer.listen(3000, () => {
    console.log("ứng dụng đang chạy trên cổng 3000");
  });
});

initPermissionsCache();