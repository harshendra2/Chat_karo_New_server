const express=require('express');
const router=new express.Router();
const controller=require('../controllers/User_controller');
const {upload}= require("../middleware/Profile");
const authenticateUser=require("../Utilities/authnticUser");

router.post('/signup',controller.UserRigistration);
router.post("/login",controller.UserLogin);

router.get("/holder/details/:id",authenticateUser,controller.GetHolderDetails);
router.post("/update-profile/:id",authenticateUser,upload,controller.ProfileUpdate);
router.get("/Sender/details/:UserId",controller.GetSenderDetails);

router.post("/candidate/search/:id",authenticateUser,controller.GetCandidateSearchList);

router.put("/candidate/status/follow/:id/:userId",authenticateUser,controller.FollowCandidate);

router.get("/candidate/request/user/:id",authenticateUser,controller.GetallRequestedUser);

router.put("/candidate/accept/request/:id/:userId",authenticateUser,controller.AcceptRequest);

module.exports=router;