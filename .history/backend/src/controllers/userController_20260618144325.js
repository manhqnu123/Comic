import User from "../model/User.js";
import Role from "../model/Role.js";
import bcrypt from "bcryptjs";
import transporter from "../config/email.js";


export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.log("Lỗi ở getUserById");
    res.status(500).json({message: "Lỗi hệ thống", error: err.message});
  }
};

export const getListUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const userRole = await Role.findOne({ name: "user" });

    const [users, total] = await Promise.all([
      User.find({ role: userRole._id })
        .select("-password -__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ role: userRole._id }),
    ]);

    res.json({
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Lỗi ở getListUsers:", err);
    res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
  }
};

export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        user.username = req.body.username || user.username;
        user.avatar = req.body.avatar || user.avatar;

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (err) {
        console.log("Lỗi ở updateUser");
        res.status(500).json({message: "Lỗi hệ thống", error: err.message});
    }
}

export const changePassword = async (req, res) => {
    try{
        const {oldPass, newPass} = req.body;
        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(oldPass, user.password);

        if(!isMatch) {
            return res.status(400).json({message: "Mật khẩu cũ không đúng"});
        }

        user.password = await bcrypt.hash(newPass, 10);
        await user.save();
        res.json({message: "Đổi mật khẩu thành công"});
    } catch (err) {
        console.log("Lỗi ở changePassword");
        res.status(500).json({message: "Lỗi hệ thống", error: err.message});
    }
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng cung cấp email." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email không tồn tại trên hệ thống." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const mailOptions = {
      from: `"Hỗ trợ hệ thống" <${process.env.EMAIL_USER || "manhlk200@gmail.com"}>`,
      to: user.email,
      subject: "Mã OTP khôi phục mật khẩu của bạn",
      html: `
        <h3>Yêu cầu đặt lại mật khẩu</h3>
        <p>Chào bạn,</p>
        <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu từ tài khoản của bạn. Mã OTP của bạn là:</p>
        <h2 style="color: #4CAF50; letter-spacing: 2px;">${otp}</h2>
        <p>Mã này có hiệu lực trong vòng <b>5 phút</b>. Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Mã OTP đã được gửi đến email của bạn." });
  } catch (err) {
    console.error("Lỗi ở forgotPassword:", err);
    res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
  }
};

//xác minh otp và đổi mật khẩu mới
export const verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({
          message: "Vui lòng nhập đầy đủ thông tin (Email, OTP, Mật khẩu mới).",
        });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Mã OTP không chính xác." });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn." });
    }


    user.password = await bcrypt.hash(newPassword, 10);

    // Xóa OTP cũ sau khi đổi mật khẩu thành công
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Đổi mật khẩu mới thành công!" });
  } catch (err) {
    console.error("Lỗi ở verifyOtpAndResetPassword:", err);
    res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
  }
};

export const deleteUser = async (req, res) => {
    try{
        const user = await User.findById(req.params.id);

        await user.deleteOne();
        res.json({message: "Xóa thành công."});
    } catch (err) {
        console.log("Lỗi ở deleteUser");
        res.status(500).json({message: "Lỗi hệ thống", error: err.message});
    }
}
