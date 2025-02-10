import express from 'express';
import {checkAuth} from '../controllers/authori.js';

const router = express.Router();

router.get('/checkAuth', checkAuth);


export default router;