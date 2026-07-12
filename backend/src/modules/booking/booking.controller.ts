import { Request, Response } from "express";
import BookingService from "./booking.service";
import { logger } from "../../config/logger";
import { sendSuccess } from "../../utils/apiResponse";

/**
 * Log a new booking inquiry (Public)
 */
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  const newInquiry = await BookingService.createBooking(req.body);

  logger.debug(
    `✨ [ReqID: ${req.id}] New Booking Inquiry logged: ID ${newInquiry._id} for ${
      newInquiry.name || "Anonymous"  
    }`
  );

  sendSuccess(
    res,
    {
      message: "Booking inquiry logged successfully",
      id: newInquiry._id,
    },
    201
  );
};

/**
 * Fetch booking inquiries (Admin only, paginated & filtered)
 */
export const getBookings = async (req: Request, res: Response): Promise<void> => {
  const { status, page, limit } = req.query as any;

  const result = await BookingService.getBookings(
    { status },
    { page: parseInt(page), limit: parseInt(limit) }
  );

  sendSuccess(res, result.data, 200, result.pagination);
};

/**
 * Update booking status (Admin only)
 */
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  const updatedBooking = await BookingService.updateBookingStatus(id as string, status as string);

  logger.debug(`✅ [ReqID: ${req.id}] Booking Inquiry ID ${id} status updated to ${status}`);

  sendSuccess(res, {
    message: "Booking status updated successfully",
    data: updatedBooking,
  });
};
