"use client";

import { useState } from "react";
import { Calendar as ReactCalendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/UI/Card";
import Badge from "../../components/UI/Badge";
import { CalendarIcon, MapPinIcon, ClockIcon } from "lucide-react";
import { format, parseISO, isThisWeek } from "date-fns";

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
}

const meetings: Meeting[] = [
  { id: 1, title: "Team Sync", date: "2025-03-17", time: "09:00 AM", location: "Zoom" },
  { id: 2, title: "Project Planning", date: "2025-03-19", time: "02:30 PM", location: "Google Meet" },
  { id: 3, title: "Sprint Review", date: "2025-03-21", time: "10:30 AM", location: "Microsoft Teams" },
  { id: 4, title: "One-on-One Meeting", date: "2025-03-24", time: "01:00 PM", location: "Zoom" },
  { id: 5, title: "Product Launch Discussion", date: "2025-03-26", time: "03:00 PM", location: "Google Meet" },
  { id: 6, title: "Weekly Team Check-in", date: "2025-03-28", time: "09:00 AM", location: "Slack Call" },
  { id: 7, title: "Design Review", date: "2025-03-30", time: "04:30 PM", location: "Figma" },
  { id: 8, title: "Marketing Strategy", date: "2025-03-31", time: "02:00 PM", location: "Skype" },
  { id: 9, title: "Budget Discussion", date: "2025-03-22", time: "11:00 AM", location: "Microsoft Teams" },
  { id: 10, title: "End-of-Month Recap", date: "2025-03-29", time: "05:00 PM", location: "Zoom" },
];

export default function MeetingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const weeklyMeetings = meetings
    .filter((meeting) => isThisWeek(parseISO(meeting.date), { weekStartsOn: 1 }))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const monthlyMeetings = meetings.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">📅 Meeting Calendar</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {/* 🔹 Calendar Section */}
        <Card className="p-4 shadow-xl rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">My Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactCalendar
              onChange={(date) => setSelectedDate(date as Date)}
              value={selectedDate}
              tileContent={({ date }) => {
                const hasMeeting = meetings.some(
                  (meeting) => meeting.date === date.toISOString().split("T")[0]
                );
                return hasMeeting ? <span className="text-blue-500 font-bold">●</span> : null;
              }}
              className="mx-auto border rounded-lg p-4 shadow-sm"
            />
          </CardContent>
        </Card>

        <Card className="p-4 shadow-xl rounded-2xl bg-green-50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">📆 Upcoming Meetings (This Week)</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyMeetings.length > 0 ? (
              weeklyMeetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)
            ) : (
              <p className="text-gray-500 text-center">No meetings this week.</p>
            )}
          </CardContent>
        </Card>

        <Card className="p-4 shadow-xl rounded-2xl bg-blue-50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">📅 Meetings This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyMeetings.length > 0 ? (
              monthlyMeetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)
            ) : (
              <p className="text-gray-500 text-center">No meetings this month.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MeetingCard({ meeting }: { meeting: Meeting }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white shadow-md rounded-lg mb-3 border-l-4 border-blue-500">
      <CalendarIcon className="text-blue-500 w-6 h-6" />
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{meeting.title}</h3>
        <p className="text-sm flex items-center gap-1 text-gray-600">
          <ClockIcon className="w-4 h-4 text-gray-500" /> {meeting.time}
        </p>
        <p className="text-sm flex items-center gap-1 text-gray-600">
          <MapPinIcon className="w-4 h-4 text-red-500" /> {meeting.location}
        </p>
      </div>
      <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-semibold px-3 py-1">
        {format(parseISO(meeting.date), "MMM dd")}
      </Badge>
    </div>
  );
}