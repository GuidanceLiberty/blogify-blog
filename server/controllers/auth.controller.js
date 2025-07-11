import { User } from "../models/User.js"
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookies } from "../utils/generateTokenAndSetCookies.js";
import { loginSchema, signupSchema } from "../schema/Index.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";
import crypto from 'crypto'


export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if(!user){
            return res.status(400).json({
                seccess: false, message: "User not found"
            })
        }
        res.status(200).json({
            succes: true, message: "User found", user
        })
    } catch (error) {
        return res.status(400).json ({
            success: false, message: error.message
        });
    }
}

export const signup = async (req, res) => {
  const { name, email, password, photo } = req.body;

  // ✅ Log the incoming body
  console.log("📥 Received signup data:", { name, email, password, photo });

  // Validate with Joi schema
  const { error } = signupSchema.validate({ name, email, password });

  try {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Check if user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Log the photo value specifically
    console.log("🖼️ Profile photo URL received:", photo);

    // Use full Cloudinary image URL
    const image = photo;

    // Generate verification token (placeholder for now)
    const verificationToken = 123456;

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      photo: image, // full Cloudinary URL
      verificationToken,
    });

    await user.save();

    // ✅ Log confirmation of user creation
    console.log("✅ User created:", user);

    // Set JWT cookie
    generateTokenAndSetCookies(res, user._id);

    res.status(201).json({
      success: true,
      message: "Account was created successfully",
      user: { ...user._doc, password: undefined },
    });

  } catch (error) {
    console.error("❌ Signup error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




export const login = async (req, res) => {
    const { email, password} = req.body;
    //validate with schema
    const { error } = loginSchema.validate({ email, password });
    try {
        if(error){
            return res.status(400).json({
                success: false, message: error.details[0].message
            });
        }
        const user = await User.findOne ({ email });
        if (!user) {
            return res.status(400).json({
                success: false, message: "No user found for the provided credentials!"
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({
                success: false, message: "No user found for the provided credentials!"
            });
        }

        const token = generateTokenAndSetCookies(res, user._id);

        user.lastLogin = new Date();
        await user.save();

        res.status(201).json({
            success: true, message: "Login was successful",
            user: { token, ...user._doc, password: undefined}
        });

    } catch (error) {
        return res.status(400).json({
            success: false, message: error.message
        }); 
    }
}

export const verifyEmail = async (req, res) => {
    const { verificationCode } = req.body;

    try {
        const code = verificationCode.toString(); // Ensure consistent type
        console.log("🔍 Incoming verification code:", code);

        const user = await User.findOne({
            verificationToken: code
        });

        console.log("👤 User found for verification:", user);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token"
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // await sendWelcomeEmail(user.email, user.name); // Optional

        res.status(200).json({
            success: true,
            message: "Email account verified successfully",
            user: { ...user._doc, password: undefined }
        });

    } catch (error) {
        console.error("❌ Error in verifyEmail:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const forgotPassword = async (req, res) => {
	const { email } = req.body;    //return console.log("email :: ", email);
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		// await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email", code: resetToken });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};


export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;   //return console.log("LOG: ", token);

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// update password
		const hashedPassword = await bcrypt.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		// await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successfully, redirecting to login page ... " });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

// ✅ Replace your getProfile function with this:
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.user_id;

    const user = await User.findById(userId)
      .select('-password')
      .populate('posts'); // ✅ Only populate what exists

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = {
      name: user.name,
      email: user.email,
      role: user.role,
      photo: user.photo,
      lastLogin: user.lastLogin,
      isVerified: user.isVerified,
      joinedDate: user.createdAt,
      noOfPosts: user.posts?.length || 0,
    };

    return res.status(200).json({ data: profile });
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({
        success: true, message: "Logout successfully"
    });
}

export const getUsers = async(req, res) => {
    try {
        const users = await User.find();
        if (users){
            return res.status(200).json({
                success: true, message: "Users found"
            })            
        }
        return res.status(200).json({
                success: false, message: "No User found"
        })
    } catch (error) {
        console.log(error);
    }
}

export const getUser = async(req, res) => {
    const userId = req.params.user_id;

    const user_id = new ObjectId(userId); //return console.log("ID : ", )

    try {
        
        if (!user_id){
            throw new Error('User ID required');
        }

        const user = await User.findOne({_id: user_id});
        if(!user){
            return res.status(400).json({
                success: false, message: "No User record found"
        });
    }
    res.status(200).json({
        success: true, message: `${user?.name} records found`,
        data: user
    });
        
    } catch (error) {
        res.status(400).json({
            success: false, message: error.message
        });
    }
}