import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import Admin from "./admin.model";
import { AppError } from "../../utils/appError";

export class AdminService {
  /**
   * Authenticate admin login and generate JWT tokens
   */
  public static async loginAdmin(email: string, password: string) {
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      throw new AppError("Invalid email or password", 401, "UNAUTHORIZED");
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401, "UNAUTHORIZED");
    }

    // Issue access token (15 mins)
    const accessToken = jwt.sign(
      { email: admin.email, role: "admin" },
      env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Issue refresh token (7 days)
    const refreshToken = jwt.sign(
      { email: admin.email, role: "admin" },
      env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return {
      admin: {
        email: admin.email,
        role: "admin",
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Generate new access token using a valid HTTP-Only refresh token
   */
  public static async refreshAdminToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        email: string;
        role: string;
      };

      const newAccessToken = jwt.sign(
        { email: decoded.email, role: "admin" },
        env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new AppError("Invalid or expired refresh token", 401, "UNAUTHORIZED");
    }
  }
}

export default AdminService;
