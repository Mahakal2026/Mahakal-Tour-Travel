import TourPackage, { IPackage } from "./package.model";
import { AppError } from "../../utils/appError";

export class PackageService {
  /**
   * Create a new tour package
   */
  public static async createPackage(data: Partial<IPackage>): Promise<IPackage> {
    return await TourPackage.create(data);
  }

  /**
   * List tour packages, optionally filtering active ones
   */
  public static async listPackages(filters: { activeOnly?: boolean }): Promise<IPackage[]> {
    const query: any = {};
    if (filters.activeOnly) {
      query.isActive = true;
    }
    return await TourPackage.find(query).sort({ createdAt: -1 }).lean();
  }

  /**
   * Fetch single package details by ID
   */
  public static async getPackageById(id: string): Promise<any> {
    const tourPackage = await TourPackage.findById(id).lean();
    if (!tourPackage) {
      throw new AppError("Package not found", 404, "NOT_FOUND");
    }
    return tourPackage;
  }

  /**
   * Update tour package details
   */
  public static async updatePackage(id: string, data: Partial<IPackage>): Promise<IPackage> {
    const tourPackage = await TourPackage.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!tourPackage) {
      throw new AppError("Package not found", 404, "NOT_FOUND");
    }
    return tourPackage;
  }

  /**
   * Hard delete a tour package
   */
  public static async deletePackage(id: string): Promise<void> {
    const tourPackage = await TourPackage.findByIdAndDelete(id);
    if (!tourPackage) {
      throw new AppError("Package not found", 404, "NOT_FOUND");
    }
  }
}

export default PackageService;
