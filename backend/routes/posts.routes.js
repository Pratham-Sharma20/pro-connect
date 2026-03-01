import { Router } from 'express';
import { activeCheck, createPost ,getAllPosts , deletPost ,get_comments_by_post, delete_comment_of_user, increment_likes } from '../controllers/posts.controller.js';
import multer from 'multer';
import { commentPost } from '../controllers/user.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type! Only images and videos are allowed.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
});

// Public Routes
router.route("/").get(activeCheck);
router.route("/get_posts").get(getAllPosts);
router.route("/get_comments").get(get_comments_by_post);

// Protected Routes
router.route("/post").post(protect, upload.single("media"), createPost);
router.route("/delete_post").delete(protect, deletPost);
router.route("/comments").post(protect, commentPost);
router.route("/delete_comment").delete(protect, delete_comment_of_user);
router.route("/increment_likes").post(protect, increment_likes);

export default router;
