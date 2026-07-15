import BookingInquiry, { IBookingInquiry } from "./booking.model";
import { AppError } from "../../utils/appError";
import Vehicle from "../vehicle/vehicle.model";
import { calculateCanonicalFare } from "../../utils/fareCalculator";

export class BookingService {
  /**
   * Log a new booking inquiry in the database with canonical server-side price verification
   * and phone number normalization.
   */
  public static async createBooking(data: Partial<IBookingInquiry>): Promise<IBookingInquiry> {
    if (data.phone) {
      const clean = data.phone.replace(/[^\d]/g, "");
      if (clean.length >= 10) {
        data.phone = clean.slice(-10);
      }
    }

    if (data.estimatedFare !== undefined && data.estimatedFare > 0) {
      if (data.tripType === "local" || data.tripType === "outstation-round" || data.tripType === "one-way") {
        let vehicleDoc: any = null;
        if (data.vehicleId) {
          vehicleDoc = await Vehicle.findById(data.vehicleId).lean();
        }
        if (!vehicleDoc && data.vehicle) {
          vehicleDoc = await Vehicle.findOne({ type: data.vehicle, isActive: true }).lean();
        }

        if (vehicleDoc) {
          const { price: expectedPrice } = calculateCanonicalFare(
            vehicleDoc,
            data.tripType,
            data.km,
            data.days
          );

          if (expectedPrice > 0 && Math.abs(data.estimatedFare - expectedPrice) > 10) {
            throw new AppError(
              `Price verification failed: Client submitted ₹${data.estimatedFare}, but server recalculated ₹${expectedPrice}.`,
              400,
              "BAD_REQUEST"
            );
          }
        }
      }
    }

    const newInquiry = await BookingInquiry.create(data);
    return newInquiry;
  }

  /**
   * Fetch paginated and filtered list of bookings for Admin panel (lean query)
   */
  public static async getBookings(
    filters: { status?: string },
    pagination: { page: number; limit: number }
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters.status) {
      query.status = filters.status;
    }

    // Run parallel count and paginated query using compound index and .lean() for performance
    const [totalCount, data] = await Promise.all([
      BookingInquiry.countDocuments(query),
      BookingInquiry.find(query)
        .sort({ status: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Update booking status (pending/confirmed/cancelled)
   */
  public static async updateBookingStatus(id: string, status: string): Promise<IBookingInquiry> {
    const booking = await BookingInquiry.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after", runValidators: true }
    );

    if (!booking) {
      throw new AppError("Booking inquiry not found", 404, "NOT_FOUND");
    }

    return booking;
  }
}

export default BookingService;
