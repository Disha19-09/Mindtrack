import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const SECRET = "mysecretkey"; // later move to env

app.use(cors());
app.use(express.json());

// DB connect
mongoose.connect("mongodb://127.0.0.1:27017/mindtrack")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Schema
const moodSchema = new mongoose.Schema({
  mood: String,
  note: String,
  userId: String,
  date: {
    type: Date,
    default: Date.now
  }
});

function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send("No token");
  }

  try {
    const decoded = jwt.verify(token, SECRET);

    req.userId = decoded.id;

    next();
  } catch (err) {
    res.status(401).send("Invalid token");
  }
}

const Mood = mongoose.model("Mood", moodSchema);

// POST
app.post("/mood", auth, async (req, res) => {
  const { mood, note } = req.body;

  try {
    await Mood.create({
      mood,
      note,
      userId: req.userId
    });

    res.send("Mood saved");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving mood");
  }
});

// GET
app.get("/moods", auth, async (req, res) => {
  try {
    const data = await Mood.find({
      userId: req.userId
    });

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching moods");
  }
});

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.send("User registered successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Signup error");
  }
});



app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).send("Invalid password");

    const token = jwt.sign({ id: user._id }, SECRET);

    res.json({ token });

  } catch (err) {
    console.log(err);
    res.status(500).send("Login error");
  }
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

// start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});