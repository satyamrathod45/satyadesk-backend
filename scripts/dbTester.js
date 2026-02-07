import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
const resetDatabase = async () => {
  try {
    await mongoose.connect("mongodb+srv://satyamrathodi70_db_user:pL68PWMD2cpd1zQ2@cluster0.il8t0vo.mongodb.net/?appName=Cluster0");
    console.log("✅ DB connected");

    await User.deleteMany({});
    console.log("🧹 All users deleted");

    const passwordHash = await bcrypt.hash("@Satyam09A",
      10
    );
    const admin = await User.create({
      name: "Main Admin",
      phone: "9999999999",
      applicationNumber: "ADMIN001",
      passwordHash,
      role: "admin",
      mustChangePassword: false
    });

    console.log("👑 Admin created:", {
      id: admin._id,
      applicationNumber: admin.applicationNumber
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting DB:", error.message);
    process.exit(1);
  }
};

resetDatabase();
