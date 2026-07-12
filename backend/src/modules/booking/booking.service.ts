import BookingInquiry, { IBookingInquiry } from "./booking.model";
import { AppError } from "../../utils/appError";

export class BookingService {
  /**
   * Log a new booking inquiry in the database
   */
  public static async createBooking(data: Partial<IBookingInquiry>): Promise<IBookingInquiry> {
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
