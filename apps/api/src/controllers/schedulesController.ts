import { Request, Response } from 'express';
import { BookingModel } from '../models/Booking.js';
import { ResourceModel } from '../models/Resource.js';

export async function getMasterSchedule(req: Request, res: Response): Promise<void> {
  const bookings = await BookingModel.find().sort({ date: 1, startTime: 1 }).lean();
  res.json(bookings);
}

export async function createBooking(req: Request, res: Response): Promise<void> {
  const { title, resourceId, resourceName, buildingName, date, startTime, endTime, attendees, type } = req.body;
  const organizer = (req as any).user?.name || 'Department Faculty';

  const booking = await BookingModel.create({
    title,
    resourceId,
    resourceName,
    buildingName,
    organizer,
    date,
    startTime,
    endTime,
    attendees,
    type: type || 'CLASS',
    status: 'SCHEDULED',
  });

  // Also sync with Resource schedule
  await ResourceModel.findOneAndUpdate(
    { $or: [{ _id: resourceId }, { code: resourceId }, { name: resourceName }] },
    {
      $push: {
        schedule: {
          bookingId: booking._id.toString(),
          title,
          organizer,
          startTime,
          endTime,
          attendees,
          status: 'SCHEDULED',
          type: type || 'CLASS',
        },
      },
    }
  );

  res.json({ success: true, booking });
}
