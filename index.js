import express from 'express';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import postRoutes from './routes/post.js';
import authoriRoutes from './routes/authori.js';
import relationshipsRoutes from './routes/relationships.js';
import commentsRoutes from './routes/comment.js';
import likesRoutes from './routes/likes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../frontend/public/upload')
  },
  filename: function (req, file, cb) {
    
    cb(null, Date.now() + file.originalname)
  }
})

const upload = multer({ storage: storage });



const dbPath = join(__dirname, 'social.db');
let db = null;  

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(8800, () => {
      console.log(`Server Running at http://localhost:8800`);
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);  
  }
};


initializeDbAndServer();

export { db };
app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (file) {
    res.status(200).json(file.filename);
  } else {
    res.status(400).json({ message: "File upload failed" });
  }
})
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/relationships', relationshipsRoutes);
app.use('/api', authoriRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/likes', likesRoutes);

