export interface Attendee {
  full_name: string;
  email: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  participants: Attendee[];
  location?: string;
  status: number // 0: pending, 1: accepted, 2: rejected
}
