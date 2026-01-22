import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId,io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        // Get unread message counts for each user
        const usersWithUnreadCounts = await Promise.all(
            filteredUsers.map(async (user) => {
                const unreadCount = await Message.countDocuments({
                    senderId: user._id,
                    receiverId: loggedInUserId,
                    status: { $ne: "seen" }
                });
                return { ...user.toObject(), unreadCount };
            })
        );

        res.status(200).json(usersWithUnreadCounts);
    } catch (error) {
        console.log("Error in getUsersForSidebar", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const {id:userToChatId} = req.params;
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [
                {senderId: myId , receiverId: userToChatId},
                {senderId: userToChatId , receiverId: myId},
            ]
        }).populate({
            path: 'replyTo',
            select: 'text senderId image'
        });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const sendMessage = async (req, res) => {
    try {
      const { text, image, replyTo } = req.body;
      const { id: receiverId } = req.params;
      const senderId = req.user._id;
  
      let imageUrl;
      if (image) {
        // Upload base64 image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      }
  
      const newMessage = new Message({
        senderId,
        receiverId,
        text,
        image: imageUrl,
        replyTo: replyTo || null
      });
  
      await newMessage.save();

      // Populate replyTo details for the immediate response
      await newMessage.populate({
        path: 'replyTo',
        select: 'text senderId image'
      });
  
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
  
      res.status(201).json(newMessage);
    } catch (error) {
      console.log("Error in sendMessage controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  export const markMessagesAsSeen = async (req, res) => {
    try {
      const { id: userToChatId } = req.params;
      const myId = req.user._id;
  
      await Message.updateMany(
        { senderId: userToChatId, receiverId: myId, status: { $ne: "seen" } },
        { $set: { status: "seen" } }
      );
  
      // Emit event to sender to update their UI (e.g. double ticks)
      const receiverSocketId = getReceiverSocketId(userToChatId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messagesSeen", { receiverId: myId });
      }
  
      res.status(200).json({ message: "Messages marked as seen" });
    } catch (error) {
      console.log("Error in markMessagesAsSeen controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };