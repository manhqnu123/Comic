import User from "../model/User.js";
import bcrypt from "bcryptjs";

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

    const [users, total] = await Promise.all([
      User.find({ role: "user" })
        .select("-password -__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ role: "user" }),
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
