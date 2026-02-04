// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import { ENV } from "../lib/env.js";
// import { generateToken } from "../lib/generatetoken.js";
// import { sendProfileUpdatedEmail, sendWelcomeEmail } from "../emails/emailHandlers.js";
// import cloudinary from "../lib/cloudinary.js";
// import dotenv from "dotenv";

// dotenv.config();

// export const signup = async (req, res) => {
//   const { fullName, email, password } = req.body;

//   try {
//     if (!fullName || !email || !password) {
//       return res.status(400).json({ message: "Please provide all the required fields" });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({ message: "Password must be at least 6 characters long" });
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ message: "Invalid email address" });
//     }

//     const user = await User.findOne({ email: email });

//     if (user) {
//       return res.status(400).json({ message: "User with this email already exists" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = new User({
//       fullName: fullName,
//       email: email,
//       password: hashedPassword,
//       profilePic: ""
//     });


//     if (newUser) {
//       const savedUser = await newUser.save();
//       generateToken(savedUser._id, res);

//       // res.status(201).json({
//       //   _id: newUser._id,
//       //   fullName: newUser.fullName,
//       //   email: newUser.email,
//       //   profilePic: newUser.profilePic,
//       // });

//       res.status(201).json({
//         user: {
//           _id: newUser._id,
//           fullName: newUser.fullName,
//           email: newUser.email,
//           profilePic: newUser.profilePic,
//         }
//       });




//       try {
//         await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
//       } catch (error) {
//         console.error("Failed to send welcome email:", error);
//       }
//     } else {
//       return res.status(400).json({ message: "Invalid user data" });
//     }
//   } catch (error) {
//     console.log("Error in signup controller:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };


// export const login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     if (!email || !password) {
//       return res.status(400).json({ message: "Please provide all the required fields" });
//     }
//     const user = await User.findOne({ email: email });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid email" });
//     }
//     const isPasswordCorrect = await bcrypt.compare(password, user.password);
//     if (!isPasswordCorrect) {
//       return res.status(400).json({ message: "Invalid password" });
//     }
//     const token = generateToken(user._id, res);
//     return res.status(200).json({ message: "Login successful", token: token });
//   } catch (error) {
//     console.log("Error in login controller:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };


// export const logout = (req, res) => {
//   res.cookie("jwt", "", {
//     httpOnly: true,
//     expires: new Date(0), // expire immediately
//     secure: ENV.NODE_ENV === "development" ? false : true,
//   });
//   res.status(200).json({ message: "Logout successful" });
// };


// // export const updateProfile = async (req, res) => {
// //   const { fullName, email, password,profilePic } = req.body;
// //   try {

// //     if (fullName && !email && !password && !profilePic) {
// //       const user = await User.findByIdAndUpdate(req.user._id, { fullName: fullName }, { new: true });




// //       try {
// //         await sendProfileUpdatedEmail(user, ENV.CLIENT_URL, ["fullName"]);
// //       } catch (error) {
// //         console.error("Failed to send welcome email:", error);
// //       }


// //       res.status(200).json({ message: "Profile Name updated successfully", Updated_User: user });


// //     }
// //     if (email && !fullName && !password && !profilePic) {
// //       const user = await User.findByIdAndUpdate(req.user._id, { email: email }, { new: true });



// //       try {
// //         await sendProfileUpdatedEmail(user, ENV.CLIENT_URL, ["email"]);
// //       } catch (error) {
// //         console.error("Failed to send welcome email:", error);
// //       }


// //       res.status(200).json({ message: "Profile email updated successfully", Updated_User: user });

// //     }

// //     if (password && !fullName && !email && !profilePic) {
// //       const salt = await bcrypt.genSalt(10);
// //       const hashedPassword = await bcrypt.hash(password, salt);
// //       const user = await User.findByIdAndUpdate(req.user._id, { password: hashedPassword }, { new: true });

// //       try {
// //         await sendProfileUpdatedEmail(user, ENV.CLIENT_URL, ["password"]);
// //       } catch (error) {
// //         console.error("Failed to send welcome email:", error);
// //       }

// //       res.status(200).json({ message: "Profile password updated successfully", Updated_User: user });

// //     }

// //     if (profilePic && !fullName && !password && !email) {

// //       const p = await cloudinary.uploader.upload(profilePic);
// //       const user = await User.findByIdAndUpdate(req.user._id, { profilePic: p.secure_url }, { new: true });


// //       try {
// //         await sendProfileUpdatedEmail(user, ENV.CLIENT_URL, ["profilePic"]);
// //       } catch (error) {
// //         console.error("Failed to send welcome email:", error);
// //       }


// //       res.status(200).json({ message: "Profile Picture updated successfully", Updated_User: user });
// //     }





// //   }
// //   catch (error) {
// //     console.log("Error in updateProfile controller:", error);
// //     return res.status(500).json({ message: "Internal server error" });
// //   }
// // }


// export const updateProfile = async (req, res) => {
//   try {
//     const { fullName, email, password, profilePic } = req.body;

//     // Object to store updates
//     const updates = {};
//     const updatedFields = [];

//     // Name update
//     if (fullName) {
//       updates.fullName = fullName;
//       updatedFields.push("fullName");
//     }

//     // Email update
//     if (email) {
//       updates.email = email;
//       updatedFields.push("email");
//     }

//     // Password update
//     if (password) {
//       if (password.length < 6) {
//         return res.status(400).json({ message: "Password must be at least 6 characters" });
//       }
//       const salt = await bcrypt.genSalt(10);
//       updates.password = await bcrypt.hash(password, salt);
//       updatedFields.push("password");
//     }

//     // Profile picture update
//     if (profilePic) {
//       const uploadRes = await cloudinary.uploader.upload(profilePic);
//       updates.profilePic = uploadRes.secure_url;
//       updatedFields.push("profilePic");
//     }

//     // ❗ Nothing to update
//     if (updatedFields.length === 0) {
//       return res.status(200).json({
//         message: "No changes provided. Profile remains unchanged.",
//       });
//     }

//     // Update user
//     const updatedUser = await User.findByIdAndUpdate(
//       req.user._id,
//       updates,
//       { new: true }
//     ).select("-password");

//     // Send email (non-blocking)
//     try {
//       await sendProfileUpdatedEmail(updatedUser, ENV.CLIENT_URL, updatedFields);
//     } catch (emailError) {
//       console.error("Profile update email failed:", emailError);
//     }

//     // Final response
//     return res.status(200).json({
//       message: "Profile updated successfully",
//       updatedFields,
//       user: updatedUser,
//     });

//   } catch (error) {
//     console.error("Error in updateProfile controller:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };


































import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import { generateToken } from "../lib/generatetoken.js";
import {
  sendProfileUpdatedEmail,
  sendWelcomeEmail,
} from "../emails/emailHandlers.js";
import cloudinary from "../lib/cloudinary.js";
import dotenv from "dotenv";

dotenv.config();

/* ===================== SIGNUP ===================== */
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please provide all the required fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      profilePic: "",
    });

    generateToken(newUser._id, res);

    res.status(201).json({
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      },
    });

    try {
      await sendWelcomeEmail(newUser.email, newUser.fullName, ENV.CLIENT_URL);
    } catch (err) {
      console.error("Welcome email failed:", err);
    }
  } catch (error) {
    console.error("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ===================== LOGIN ===================== */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide all the required fields" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    generateToken(user._id, res);

    res.status(200).json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ===================== LOGOUT ===================== */
export const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: ENV.NODE_ENV !== "development",
  });

  res.status(200).json({ message: "Logout successful" });
};

/* ===================== UPDATE PROFILE ===================== */
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, password, profilePic } = req.body;

    const updates = {};
    const updatedFields = [];

    if (fullName) {
      updates.fullName = fullName;
      updatedFields.push("fullName");
    }

    if (email) {
      updates.email = email;
      updatedFields.push("email");
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
      updatedFields.push("password");
    }

    if (profilePic) {
      const uploadResult = await cloudinary.uploader.upload(profilePic);
      updates.profilePic = uploadResult.secure_url;
      updatedFields.push("profilePic");
    }

    if (updatedFields.length === 0) {
      return res.status(200).json({ message: "No changes provided" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select("-password");

    try {
      await sendProfileUpdatedEmail(updatedUser, ENV.CLIENT_URL, updatedFields);
    } catch (err) {
      console.error("Profile update email failed:", err);
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
