import mongoose from "mongoose";
import User from "../model/User.js";
import Role from "../model/Role.js";
import Permission from "../model/Permission.js";
import bcrypt from "bcrypt";

const MONGO_URI =
  "mongodb+srv://manhlk200_db_user:4cVy5PWXFQCM5WAQ@cluster.qccdycy.mongodb.net/Comic?appName=Cluster";

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    // Xóa dữ liệu cũ
    await Permission.deleteMany({});
    await Role.deleteMany({});
    await User.deleteMany({});

    // Tạo các quyền
    const perms = await Permission.insertMany([
      { name: "READ_COMIC" },
      { name: "UPLOAD_COMIC" },
      { name: "DELETE_COMIC" },
      { name: "MANAGE_USERS" },
      { name: "permission:read" },
      { name: "permission:create" },
      { name: "permission:update" },
      { name: "permission:delete" },
    ]);

    const readId = perms.find((p) => p.name === "READ_COMIC")._id;
    const uploadId = perms.find((p) => p.name === "UPLOAD_COMIC")._id;
    const deleteId = perms.find((p) => p.name === "DELETE_COMIC")._id;
    const manageId = perms.find((p) => p.name === "MANAGE_USERS")._id;
    const permRead = perms.find((p) => p.name === "permission:read")._id;
    const permCreate = perms.find((p) => p.name === "permission:create")._id;
    const permUpdate = perms.find((p) => p.name === "permission:update")._id;
    const permDelete = perms.find((p) => p.name === "permission:delete")._id;

    // Tạo vai trò và set quyền
    const adminRootRole = await Role.create({
      name: "admin_root",
      permissions: [
        permRead,
        permCreate,
        permUpdate,
        permDelete,
      ],
    });

    const adminRole = await Role.create({
      name: "admin",
      permissions: [readId, uploadId, deleteId, manageId],
    });

    const userRole = await Role.create({
      name: "user",
      permissions: [readId],
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);
    const hashedRootPassword = await bcrypt.hash("Admin@123456", salt);

    // Khởi tạo tài khoản mẫu
    await User.insertMany([
      {
        username: "admin_root",
        email: "admin@root.com",
        password: hashedRootPassword,
        role: adminRootRole._id,
        isRoot: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AdminRoot",
      },
      {
        username: "admin_test",
        email: "admin@test.com",
        password: hashedPassword,
        role: adminRole._id,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
      },
      {
        username: "user_test",
        email: "manhlk200@gmail.com",
        password: hashedPassword,
        role: userRole._id,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=User",
      },
    ]);

    console.log("Dữ liệu đã được khởi tạo thành công!");
    process.exit();
  } catch (error) {
    console.log("Lỗi khi khởi tạo dữ liệu:", error);
    process.exit(1);
  }
};

seedData();
