const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/socialmedia")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// POST SCHEMA
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  likes: { type: Number, default: 0 },
  comments: [{ text: String }]
});

const Post = mongoose.model("Post", postSchema);

// USER SCHEMA
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

// HOME ROUTE
app.get("/", (req, res) => {
  res.send("Backend Working 🚀");
});

// GET POSTS
app.get("/posts", async (req, res) => {
  const posts = await Post.find().sort({ _id: -1 });
  res.json(posts);
});

// CREATE POST
app.post("/posts", async (req, res) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });

  await post.save();
  res.json(post);
});

// LIKE POST
app.put("/posts/like/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  post.likes += 1;
  await post.save();

  res.json(post);
});

// COMMENT POST
app.post("/posts/comment/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  post.comments.push({
    text: req.body.text
  });

  await post.save();

  res.json(post);
});

// DELETE POST
app.delete("/posts/:id", async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted Successfully" });
});

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({
      message: "Signup Successful"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.json({
        message: "Wrong Password"
      });
    }

    res.json({
      message: "Login Successful",
      username: user.username
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// START SERVER
app.listen(5000, () => {
  console.log("Server running on port 5000");
});