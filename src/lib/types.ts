export type BookingStatus = "active" | "cancelled" | "attended" | "no_show";

export type Booking = {
  id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // "07:00"
  end_time: string; // "08:50"
  student_name: string;
  phone: string;
  comment: string | null;
  status: BookingStatus;
  cancel_token: string;
  created_at: string;
};

export type SlotView = {
  start: string;
  end: string;
  taken: boolean;
  past: boolean; // время уже прошло (для сегодня)
};
