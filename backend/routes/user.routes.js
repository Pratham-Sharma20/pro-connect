import { Router } from 'express';
import { login , register , uploadProfilePicture,updateUserProfile , getUserAndProfile, updateProfileData , getAllUserProfiles , downloadProfile, sendConnectionRequest , getConnectionRequests, whatAreMyConnections, acceptConnectionRequest, getUserProfileAndUserBasedOnUsername} from '../controllers/user.controller.js';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage : storage });

// Public Routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/user/get_all_user_profiles").get(getAllUserProfiles);
router.route("/user/get_profile_based_on_username").get(getUserProfileAndUserBasedOnUsername);

// Protected Routes
router.route("/update_profile_picture").post(protect, upload.single("profilePicture"), uploadProfilePicture);
router.route("/user_update").post(protect, updateUserProfile);
router.route("/get_user_and_profile").get(protect, getUserAndProfile);
router.route("/update_profile_data").post(protect, updateProfileData);
router.route("/user/download_profile").get(protect, downloadProfile);
router.route("/user/send_connection_request").post(protect, sendConnectionRequest);
router.route("/user/getConnection_request").get(protect, getConnectionRequests);
router.route("/user/user_connection_requests").get(protect, whatAreMyConnections);
router.route("/user/accept_connection_request").post(protect, acceptConnectionRequest);

export default router;
