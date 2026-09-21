import { AdminModel } from "@/models/AdminModel";

export class AdminController {
  static verifyAdminLogin(password: string) {
    if (!password) {
      throw new Error("Password administrator wajib diisi");
    }

    const isValid = AdminModel.verifyPassword(password);
    if (!isValid) {
      throw new Error("Kunci otorisasi administrator tidak valid");
    }

    return {
      authenticated: true,
      role: "SUPER_ADMIN",
      timestamp: Date.now(),
    };
  }

  static async getPlatformDashboard() {
    return AdminModel.getPlatformMetrics();
  }
}
