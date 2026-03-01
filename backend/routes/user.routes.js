import { Router } from 'express';
import { login , register , uploadProfilePicture,updateUserProfile , getUserAndProfile, updateProfileData , getAllUserProfiles , downloadProfile, sendConnectionRequest , getConnectionRequests, whatAreMyConnections, acceptConnectionRequest, getUserProfileAndUserBasedOnUsername} from '../controllers/user.controller.js';
import multer from 'multer';
import { profileStorage } from '../utils/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type! Only JPEG, PNG, and WEBP images are allowed.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({ 
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Public Routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/user/get_all_user_profiles").get(getAllUserProfiles);
router.route("/user/get_profile_based_on_username").get(getUserProfileAndUserBasedOnUsername);

// Protected Routes
router.route("/update_profile_picture").post(protect, upload.single("profilePicture"), uploadProfilePicture);
router.route("/user_update").post(protect, updateUserProfile);
router.route("/get_user_and_profile").get(protect, getUserAndProfile);
router.route("/profile/me").get(protect, getUserAndProfile);
router.route("/update_profile_data").post(protect, updateProfileData);
router.route("/user/download_profile").get(protect, downloadProfile);
router.route("/user/send_connection_request").post(protect, sendConnectionRequest);
router.route("/user/getConnection_request").get(protect, getConnectionRequests);
router.route("/user/user_connection_requests").get(protect, whatAreMyConnections);
router.route("/user/accept_connection_request").post(protect, acceptConnectionRequest);

export default router;
