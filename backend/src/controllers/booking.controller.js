const prisma = require('../provider/database/client');

// 1. ลงทะเบียนเข้าพัก (Check-in)
exports.checkIn = async (req, res) => {
  const { userId, roomId, checkInDate } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. ตรวจสอบสถานะห้อง
      const room = await tx.room.findUnique({
        where: { id: parseInt(roomId) }
      });

      if (!room || room.status !== 'AVAILABLE') {
        throw new Error('ห้องไม่ว่างหรือไม่พบข้อมูลห้องพัก');
      }

      // 2. สร้างข้อมูลการเข้าพัก
      const booking = await tx.booking.create({
        data: {
          userId: parseInt(userId),
          roomId: parseInt(roomId),
          checkInDate: checkInDate ? new Date(checkInDate) : new Date(),
          status: 'ACTIVE'
        }
      });

      // 3. อัปเดตสถานะห้องเป็น OCCUPIED
      await tx.room.update({
        where: { id: parseInt(roomId) },
        data: { status: 'OCCUPIED' }
      });

      return booking;
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 2. ย้ายออกจากห้อง (Move-out)
exports.checkOut = async (req, res) => {
  const { roomId } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. ค้นหาการจองที่ยัง Active อยู่ในห้องนี้
      const activeBooking = await tx.booking.findFirst({
        where: {
          roomId: parseInt(roomId),
          status: 'ACTIVE'
        }
      });

      if (!activeBooking) {
        throw new Error('ไม่พบข้อมูลการเข้าพักที่กำลังใช้งานในห้องนี้');
      }

      // 2. อัปเดตสถานะการจองเป็น COMPLETED
      const updatedBooking = await tx.booking.update({
        where: { id: activeBooking.id },
        data: {
          status: 'COMPLETED',
          checkOutDate: new Date()
        }
      });

      // 3. อัปเดตสถานะห้องกลับเป็น AVAILABLE
      await tx.room.update({
        where: { id: parseInt(roomId) },
        data: { status: 'AVAILABLE' }
      });

      return updatedBooking;
    });

    res.json({ message: 'แจ้งย้ายออกเรียบร้อย', booking: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
