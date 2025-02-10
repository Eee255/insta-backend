import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { db } from '../index.js';

export const register = async (req, res) => {
    const { name, email, password, profilePic, coverPic, desc } = req.body;
  
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    try {
      const existingUser = await db.get(checkUserQuery, [email]);
  
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists!' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const insertUserQuery = `
        INSERT INTO users (name, email, password, profilePic, coverPic, desc)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await db.run(insertUserQuery, [name, email, hashedPassword, profilePic, coverPic, desc]);
  
      return res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
      
      return res.status(500).json({ message: 'Something went wrong!' });
    }
  };


  
  export const login = async (req, res) => {
    const { email, password } = req.body;
    const getUserQuery = 'SELECT * FROM users WHERE email = ?';
  
    try {
      const user = await db.get(getUserQuery, [email]);
  
      if (!user) {
        return res.status(400).json({ message: 'User not found!' });
      }
  
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: 'Incorrect password!' });
      }
  
      const token = jwt.sign({ id: user.userId }, "your_secret_key", { expiresIn: "1h" });
      const { password: _, ...userData } = user;
  
      // Set cookie with proper security flags
      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: true,              // Use true if using HTTPS
        sameSite: "None",          // Allows cross-site cookie
        maxAge: 60 * 60 * 1000,    // 1 hour
      });
  
      return res.status(200).json({
        message: "Successfully logged in",
        token,
        userData
      });
  
    } catch (error) {
      console.error("Login Error:", error);  // Log the actual error for debugging
      return res.status(500).json({ message: 'Something went wrong!' });
    }
  };
  

// Logout a user
export const logout = (req, res) => {
    try {
      res.clearCookie("accessToken", { httpOnly: true});
  
      return res.status(200).json({ message: "Logged out successfully!" });
    } catch (error) {
     
      return res.status(500).json({ message: "Something went wrong!" });
    }
  };
  