import BookingInquiry, { IBookingInquiry } from "./booking.model";
import { AppError } from "../../utils/appError";
import Vehicle from "../vehicle/vehicle.model";

export class BookingService {
  /**
   * Log a new booking inquiry in the database with server-side price verification
   */
  public static async createBooking(data: Partial<IBookingInquiry>): Promise<IBookingInquiry> {
    if (data.estimatedFare !== undefined && data.estimatedFare > 0) {
      if (data.tripType === "local" || data.tripType === "outstation-round") {
        let vehicleDoc: any = null;
        if (data.vehicleId) {
          vehicleDoc = await Vehicle.findById(data.vehicleId);
        }
        if (!vehicleDoc && data.vehicle) {
          vehicleDoc = await Vehicle.findOne({ type: data.vehicle, isActive: true });
        }

        if (vehicleDoc) {
          let expectedPrice = 0;
          const rateOutstation = vehicleDoc.pricePerKm || 0;

          if (data.tripType === "local") {
            expectedPrice = vehicleDoc.localPrice || (rateOutstation * 80);
          } else if (data.tripType === "outstation-round") {
            const numDays = Number(data.days) || 1;
            const numKm = Number(data.km) || numDays * 250;

            if (vehicleDoc.outstationPrice && vehicleDoc.outstationPrice > 0) {
              const includedKm = numDays * 250;
              const basePrice = numDays * vehicleDoc.outstationPrice;
              const excessKm = Math.max(0, numKm - includedKm);
              expectedPrice = basePrice + (excessKm * rateOutstation);
            } else if (vehicleDoc.outstationTiers && vehicleDoc.outstationTiers.length > 0) {
              const exactTier = vehicleDoc.outstationTiers.find((t: any) => t.days === numDays);
              if (exactTier) {
                const includedKm = exactTier.minKm || (numDays * 250);
                const excessKm = Math.max(0, numKm - includedKm);
                if (exactTier.flatDayPrice && exactTier.flatDayPrice > 0) {
                  expectedPrice = exactTier.flatDayPrice + (excessKm * exactTier.price);
                } else {
                  expectedPrice = (includedKm * exactTier.price) + (excessKm * exactTier.price);
                }
              } else {
                const sorted = [...vehicleDoc.outstationTiers].sort((a: any, b: any) => a.days - b.days);
                const maxTier = sorted[sorted.length - 1];
                if (numDays > maxTier.days) {
                  const rate = maxTier.price || rateOutstation;
                  const includedKm = numDays * 250;
                  expectedPrice = (includedKm * rate) + (Math.max(0, numKm - includedKm) * rate);
                } else {
                  const nextTier = sorted.find((t: any) => t.days >= numDays) || maxTier;
                  const rate = nextTier.price || rateOutstation;
                  const includedKm = numDays * 250;
                  expectedPrice = (includedKm * rate) + (Math.max(0, numKm - includedKm) * rate);
                }
              }
            } else {
              const includedKm = numDays * 250;
              expectedPrice = (includedKm * rateOutstation) + (Math.max(0, numKm - includedKm) * rateOutstation);
            }
          }

          if (expectedPrice > 0 && Math.abs(data.estimatedFare - expectedPrice) > 10) {
            throw new AppError(`Price verification failed: Client submitted ₹${data.estimatedFare}, but server recalculated ₹${expectedPrice}.`, 400, "BAD_REQUEST");
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
        .sort({ status: 1, createdAt: -1 }) // Aligns with compound index: { status: 1, createdAt: -1 }
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
