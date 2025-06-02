const User=require("../models/User_model")
const Follower=require("../models/Follow_User");
const Chat=require("../models/Chat_model");

exports.getAllUser = async (UserId) => {
   try{
        const currentUser = await User.findById(UserId);
    if (!currentUser) {
      return []
    }
    currentUser.OnLine=true;
    await currentUser.save();

    const baseQuery = {
      _id: { $ne: currentUser._id },
    };

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
        finalList.push({ ...follow.requester._doc}); 
      }
    }

    for (const follow of receivedFollowings) {
      const userId = String(follow.follower._id);
      if (!followedIds.has(userId)) {
        followedIds.add(userId);
        if (follow.Status === "Following") {
          finalList.push({ ...follow.follower._doc});
        }
      }
    }

   
    return finalList || [];
    }catch(error){
      console.log(error);
    }
};


exports.OffLine=async(UserId)=>{
  console.log("apput tesing Offline ",UserId)
  try{
  const currentUser = await User.findById(UserId);
    if (!currentUser) {
      return []
    }
    currentUser.OnLine=false;
    await currentUser.save();
 return true;
  }catch(error){
    console.log(error);
  }
}

exports.SetOnline=async(UserId)=>{
  try{
  const currentUser = await User.findById(UserId);
    if (!currentUser) {
      return []
    }
    currentUser.OnLine=true;
    await currentUser.save();
 return true;
  }catch(error){
    console.log(error);
  }
}

exports.getAllMessag=async(sender,reciever)=>{
  try{

    return await Chat.find({
      $or: [
        { Sender: sender, Reciever: reciever },
        { Sender: reciever, Reciever: sender }
      ]
    }).sort({ createdAt: 1 });
  }catch(error){
     console.log(error);
     return [];
  }
}


exports.AddNewMessage=async(data)=>{
  try{
  const newMsg = new Chat(data);
    await newMsg.save();
    return newMsg.toObject();
  }catch(error){
    console.log(error);
  }
}