// Create web server
// Load modules
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Load models
const Comment = require('../../models/Comment');
const Post = require('../../models/Post');

// Load auth middleware
const auth = require('../../middleware/auth');

// @route   POST api/comments
// @desc    Create a comment
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      body('text', 'Text is required')
        .not()
        .isEmpty(),
      body('post', 'Post is required')
        .not()
        .isEmpty(),
      body('name', 'Name is required')
        .not()
        .isEmpty(),
      body('avatar', 'Avatar is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    // Check for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return errors
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Create comment
      const comment = new Comment({
        text: req.body.text,
        post: req.body.post,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      });

      // Save comment to database
      await comment.save();

      // Find post
      const post = await Post.findById(req.body.post);

      // Add comment to post
      post.comments.unshift(comment);

      // Save post to database
      await post.save();

      // Return comment
      res.json(comment);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/comments
// @desc    Get all comments
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Find comments
    const comments = await Comment.find();

    // Return comments
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   GET api/comments/:id
// @desc    Get comment by id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Find comment