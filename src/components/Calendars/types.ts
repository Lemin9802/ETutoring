export interface Attendee {
  name: string;
  email: string;
  avatar?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  attendees: Attendee[];
  location?: string;
}
