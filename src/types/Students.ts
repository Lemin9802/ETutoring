export interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  profile_picture: string | null;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  phone_number?: string;
  nationality?: string;
  last_login_time?: string;
  created_at?: string;
  updated_at?: string;
}
