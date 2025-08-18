import { Router } from 'express';
import { login , register , uploadProfilePicture,updateUserProfile , getUserAndProfile, updateProfileData , getAllUserProfiles , downloadProfile, sendConnectionRequest , getConnectionRequests, whatAreMyConnections, acceptConnectionRequest, getUserProfileAndUserBasedOnUsername} from '../controllers/user.controller.js';
import multer from 'multer';
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

router.route("/update_profile_picture").post(upload.single("profilePicture"),uploadProfilePicture);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/user_update").post(updateUserProfile);
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);
router.route("/user/get_all_user_profiles").get(getAllUserProfiles);
router.route("/user/download_profile").get(downloadProfile);
router.route("/user/send_connection_request").post(sendConnectionRequest);
router.route("/user/getConnection_request").get(getConnectionRequests);
router.route("/user/user_connection_requests").get(whatAreMyConnections);
router.route("/user/accept_connection_request").post(acceptConnectionRequest);
router.route("/user/get_profile_based_on_username").get(getUserProfileAndUserBasedOnUsername);
export default router;  