const bcrypt=require("bcryptjs")
const User=require("../models/User_model")
const Follower=require("../models/Follow_User");


exports.UserRigistration=async(req,res)=>{
   const { email, password,name} = req.body;
  const Email=email.trim()
  const Password=password.trim()
  try {
    const existingAdmin = await User.findOne({ email:Email});
    if (existingAdmin) {
      return res.status(400).json({ error: "Email already registered" });
    }
    
    const hashedPassword = await bcrypt.hash(Password, 12);

    const newCandidate = new User({
      name:name,
      email:Email,
      password: hashedPassword,
    });

    await newCandidate.save();
    return res.status(201).json({ message: "Registration Successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}


exports.UserLogin=async(req,res)=>{
    const {email,password}=req.body;
    try{
 const preUser = await User.findOne({ email });
    if (!preUser) {
      return res.status(400).json({ error: "This Email Id is not registered in our Database" });
    }

    const passwordMatch = await bcrypt.compare(password, preUser.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = await preUser.generateAuthtoken();
    return res.status(200).json({ message: "User Login Successfully", userToken: token,userId:preUser?._id });
    }catch(error){
        return res.status(500).json({error:"Internal server error"});
    }
}


exports.GetHolderDetails=async(req,res)=>{
  try{
    let data=await User.findById(req.id._id);
    if(data){
   return res.status(200).send(data);
    }else{
      return res.status(402).json({error:"Candidate not found"});
    }

  }catch(error){
    return res.status(500).json({error:"Internal server error"});
  }
}


exports.ProfileUpdate=async(req,res)=>{
  const Id=req.id._id;
  
  try{
   const baseUrl=`http://13.232.109.205/:4000`
     const data=await User.findByIdAndUpdate(Id,{Profile:`${baseUrl}/${req.file?.path.replace(/\\/g, '/')}`})
    if(data){
      return res.status(200).json({message:"Profile updated successfully"});
    }else{
      return res.status(400).json({error:"profile is not updated"});
    }

  }catch(error){
    return res.status(500).json({error:"Internal server error"});
  }
}

exports.GetSenderDetails=async(req,res)=>{
  const {UserId}=req.params;
   try{
    let data=await User.findById(UserId);
    if(data){
   return res.status(200).send(data);
    }else{
      return res.status(402).json({error:"Candidate not found"});
    }

  }catch(error){
    return res.status(500).json({error:"Internal server error"});
  }
}


exports.GetCandidateSearchList = async (req, res) => {
  const { search } = req.body;

  try {
    const currentUser = await User.findById(req.id._id);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const baseQuery = {
      _id: { $ne: currentUser._id },
    };

    if (search && search.trim() !== "") {
      baseQuery.name = { $regex: search.trim(), $options: "i" };
    }

    const allUsers = await User.find(baseQuery);
    const userIds = allUsers.map(user => user._id);

    const sentFollowings = await Follower.find({
      follower: currentUser._id,
      requester: { $in: userIds },
    }).populate("requester");

    const receivedFollowings = await Follower.find({
      requester: currentUser._id,
      follower: { $in: userIds },
    }).populate("follower");

    const followedIds = new Set();

    const finalList = [];

    for (const follow of sentFollowings) {
      followedIds.add(String(follow.requester._id));
      if (follow.Status === "Following") {
        finalList.push({ ...follow.requester._doc, status: "Connected" }); 
      } else {
        finalList.push({ ...follow.requester._doc, status: "Following" });
      }
    }

    for (const follow of receivedFollowings) {
      const userId = String(follow.follower._id);
      if (!followedIds.has(userId)) {
        followedIds.add(userId);
        if (follow.Status === "Following") {
          finalList.push({ ...follow.follower._doc, status: "Accepted" });
        } else {
          finalList.push({ ...follow.follower._doc, status: "Accept" }); // Accept the request
        }
      }
    }

    // 3. Remaining users
    const remainingUsers = allUsers.filter(user => !followedIds.has(String(user._id)));
    for (const user of remainingUsers) {
      finalList.push({ ...user._doc, status: "New" }); // Can send request
    }

    return res.status(200).json({ users: finalList });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};




exports.FollowCandidate=async(req,res)=>{
  const {userId}=req.params;
  try{
 const currentUser =new Follower({follower:req.id._id,requester:userId})
 await currentUser.save();

   return res.status(201).json({message:"User followed successfully!"});
  }catch(error){
    return res.status(500).json({error:"Internal server error"});
  }
}

exports.GetallRequestedUser=async(req,res)=>{
  try{
 const Users = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.user._id) } },
      { $unwind: "$accepted" },
      { $match: { "accepted.status": false } },
      { $project: { accepted: 1, _id: 0 } }
    ]);

    return res.status(200).json({ requested: Users });
  }catch(error){
    return res.status(500).json({error:'Internal server error'});
  }
}

exports.AcceptRequest = async (req, res) => {
  const { userId } = req.params;
  try {
   const currentUser =await Follower.findOneAndUpdate({follower:userId,requester:req.id._id},{Status:"Following"},{new:true})
   return res.status(201).json({message:"User followed successfully!"});
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
