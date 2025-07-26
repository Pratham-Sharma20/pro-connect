import { Router } from 'express';
import { activeCheck, createPost ,getAllPosts , deletPost ,get_comments_by_post, delete_comment_of_user, increment_likes } from '../controllers/posts.controller.js';
import multer from 'multer';
import { get } from 'mongoose';
import { commentPost } from '../controllers/user.controller.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer ({ storage: storage });

router.route("/").get(activeCheck);
router.route("/post").post(upload.single("media"),createPost)
router.route("/get_posts").get(getAllPosts);
router.route("/delete_post").post(deletPost);
router.route("/comments").get(commentPost);
router.route("/get_comments").get(get_comments_by_post);
router.route("/delete_comment").delete(delete_comment_of_user);
router.route("increment_likes").post(increment_likes);

export default router;