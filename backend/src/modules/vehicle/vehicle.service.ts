import Vehicle, { IVehicle } from "./vehicle.model";
import { AppError } from "../../utils/appError";

export class VehicleService {
  /**
   * Create a new vehicle record
   */
  public static async createVehicle(data: Partial<IVehicle>): Promise<IVehicle> {
    return await Vehicle.create(data);
  }

  /**
   * List vehicles, optionally filtered by isActive
   */
  public static async listVehicles(filters: { activeOnly?: boolean }): Promise<IVehicle[]> {
    const query: any = {};
    if (filters.activeOnly) {
      query.isActive = true;
    }
    return await Vehicle.find(query).sort({ createdAt: -1 }).lean();
  }

  /**
   * Fetch a single vehicle by ID
   */
  public static async getVehicleById(id: string): Promise<IVehicle> {
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      throw new AppError("Vehicle not found", 404, "NOT_FOUND");
    }
    return vehicle;
  }

  /**
   * Update a vehicle record
   */
  public static async updateVehicle(id: string, data: any): Promise<IVehicle> {
    const updateQuery: any = { $set: {}, $unset: {} };
    for (const key of Object.keys(data)) {
      if (data[key] === undefined || data[key] === null || data[key] === "") {
        if (key === "localPrice" || key === "outstationPrice" || key === "subtitle") {
          updateQuery.$unset[key] = 1;
        }
      } else {
        updateQuery.$set[key] = data[key];
      }
    }
    if (Object.keys(updateQuery.$unset).length === 0) delete updateQuery.$unset;
    if (Object.keys(updateQuery.$set).length === 0) delete updateQuery.$set;

    const vehicle = await Vehicle.findByIdAndUpdate(id, updateQuery, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!vehicle) {
      throw new AppError("Vehicle not found", 404, "NOT_FOUND");
    }
    return vehicle;
  }

  /**
   * Hard delete a vehicle record
   */
  public static async deleteVehicle(id: string): Promise<void> {
    const vehicle = await Vehicle.findByIdAndDelete(id);
    if (!vehicle) {
      throw new AppError("Vehicle not found", 404, "NOT_FOUND");
    }
  }
}

export default VehicleService;
