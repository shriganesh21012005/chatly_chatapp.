import Message from "../models/Message.js";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";
import { createNewMessageEmail } from "../emails/emailHandlers.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
import mongoose from "mongoose";



export const getAllContacts = async (req, res) => {
  try {
    const contacts = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.status(200).json(contacts);
  }
  catch (error) {
    console.log("Error in getAllContacts controller:", error);
    res.status(500).json({ message: " Error in getAllContacts controller only.." });
  }
}


export const getMessagesByUserId = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId, receiverId: userId },
        { senderId: userId, receiverId: loggedInUserId },
      ],
    });
    res.status(200).json(messages);
  }
  catch (error) {
    console.log("Error in getMessagesByUserId controller:", error);
    res.status(500).json({ message: " Error in getMessagesByUserId controller only.." });
  }
}


// export const sendMessage = async (req, res) => {
//   try {
//     const { text, image } = req.body;

//     const loggedInUserId = req.user._id;
//     const { userId: receiverId } = req.params;


//     if (!text && !image) {
//       return res.status(400).json({ message: "Text or image is required." });
//     }
//     if (loggedInUserId.equals(receiverId)) {
//       return res.status(400).json({ message: "Cannot send messages to yourself." });
//     }
//     const receiverExists = await User.exists({ _id: receiverId });
//     if (!receiverExists) {
//       return res.status(404).json({ message: "Receiver not found." });
//     }



//     let img_url;
//     if (image) {
//       const ig = await cloudinary.uploader.upload(image);
//       img_url = ig.secure_url;
//     }

//     try {
//       const message = new Message({
//         senderId: loggedInUserId,
//         receiverId: receiverId,
//         // Here actually mongodb was expecting the User Object's Id not the entire Object itself..but moongose had accepted this request of ours because even if we pass an object containing the object id mngoose wants..moongose can extract the required id from that object automatically . Thus this line dsen't throw an error.
//         text: text,
//         image: img_url,
//       });

//       await message.save();
//       const sender = await User.findById(loggedInUserId);
//       const receiver = await User.findById(receiverId);

//       try {

//         await createNewMessageEmail(sender, receiver, message, ENV.CLIENT_URL);


//       } catch (emailError) {
//         console.error("New Message email failed:", emailError);
//       }

//       // return res.status(201).json({ message: "Message sent successfully", data: message });
      
//       return res.status(201).json(message);

//     }
//     catch (error) {
//       console.log("Error in sendMessage controller:", error);
//       res.status(500).json({ message: " Error in message creation only.." });
//     }



//   }




//   catch (error) {
//     console.log("Error in sendMessage controller:", error);
//     res.status(500).json({ message: " Error in sendMessage controller only.." });
//   }
// }


// export const getChatPartners = async (req, res) => {
//   try {
//     const loggedInUserId = req.user._id;
//     const { userId } = req.params;

//     const messages = await Message.find({
//       $or: [
//         { senderId: loggedInUserId, receiverId: userId },
//         { senderId: userId, receiverId: loggedInUserId },
//       ],
//     });


//     const chatPartnerIds = [
//       ...new Set(
//         messages.map((msg) =>
//           msg.senderId.toString() === loggedInUserId.toString()
//             ? msg.receiverId.toString()
//             : msg.senderId.toString()
//         )
//       ),
//     ];

//     const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

//     res.status(200).json(chatPartners);
//   } catch (error) {
//     console.log("Error in getChatPartners controller:", error);
//     res.status(500).json({ message: " Error in getChatPartners controller only.." });
//   }
// }


export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const senderId = req.user._id;
    const { userId: receiverId } = req.params;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }

    let img_url;
    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      img_url = upload.secure_url;
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text,
      image: img_url,
    });

    // 🔴 REAL-TIME DELIVERY
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};



// export const getChatPartners = async (req, res) => {
//   try {
//     const loggedInUserId = req.user._id;

//     // find all the messages where the logged-in user is either sender or receiver
//     const messages = await Message.find({
//       $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
//     });

//     const chatPartnerIds = [
//       ...new Set(
//         messages.map((msg) =>
//           msg.senderId.toString() === loggedInUserId.toString()
//             ? msg.receiverId.toString()
//             : msg.senderId.toString()
//         )
//       ),
//     ];

//     const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

//     res.status(200).json(chatPartners);
//   } catch (error) {
//     console.error("Error in getChatPartners: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };



export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // 1️⃣ Get latest message per chat partner
    const latestMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: loggedInUserId },
            { receiverId: loggedInUserId },
          ],
        },
      },
      {
        $addFields: {
          chatPartner: {
            $cond: [
              { $eq: ["$senderId", loggedInUserId] },
              "$receiverId",
              "$senderId",
            ],
          },
        },
      },
      {
        $sort: { createdAt: -1 }, // 🔴 MOST IMPORTANT
      },
      {
        $group: {
          _id: "$chatPartner",
          lastMessageAt: { $first: "$createdAt" },
        },
      },
      {
        $sort: { lastMessageAt: -1 }, // 🔴 FINAL ORDER
      },
    ]);

    const orderedUserIds = latestMessages.map((m) => m._id);

    // 2️⃣ Fetch users
    const users = await User.find({ _id: { $in: orderedUserIds } })
      .select("-password")
      .lean();

    // 3️⃣ Preserve order manually
    const orderedUsers = orderedUserIds.map((id) =>
      users.find((u) => u._id.toString() === id.toString())
    );

    res.status(200).json(orderedUsers);
  } catch (error) {
    console.error("Error in getChatPartners:", error);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};



export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("getUserById error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


