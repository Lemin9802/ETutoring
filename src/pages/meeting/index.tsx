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
  { id: 1, title: "Team Sync", date: "2025-03-01", time: "09:00 AM", location: "Zoom" },
  { id: 2, title: "Project Planning", date: "2025-03-05", time: "02:30 PM", location: "Google Meet" },
  { id: 3, title: "Sprint Review", date: "2025-03-08", time: "10:30 AM", location: "Microsoft Teams" },
  { id: 4, title: "One-on-One Meeting", date: "2025-03-12", time: "01:00 PM", location: "Zoom" },
  { id: 5, title: "Product Launch Discussion", date: "2025-03-17", time: "03:00 PM", location: "Google Meet" },
  { id: 6, title: "Weekly Team Check-in", date: "2025-03-20", time: "09:00 AM", location: "Slack Call" },
  { id: 7, title: "Design Review", date: "2025-03-25", time: "04:30 PM", location: "Figma" },
  { id: 8, title: "Marketing Strategy", date: "2025-03-28", time: "02:00 PM", location: "Skype" },
  { id: 9, title: "Budget Discussion", date: "2025-03-10", time: "11:00 AM", location: "Microsoft Teams" },
  { id: 10, title: "End-of-Month Recap", date: "2025-03-30", time: "05:00 PM", location: "Zoom" },
];

export default function MeetingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedMeetings, setSelectedMeetings] = useState<Meeting[]>([]);

  const weeklyMeetings = meetings
    .filter((meeting) => isThisWeek(parseISO(meeting.date), { weekStartsOn: 1 }))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const monthlyMeetings = meetings.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    const dateString = date.toISOString().split("T")[0];
    const foundMeetings = meetings.filter((m) => m.date === dateString);
    setSelectedMeetings(foundMeetings);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">📅 Meeting Calendar</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

        <Card className="p-4 shadow-xl rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">My Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactCalendar
              onChange={(date) => handleDateChange(date as Date)}
              value={selectedDate}
              tileContent={({ date, view }) => {
                if (view === "month") {
                  const sameDayMeetings = meetings.filter(
                    (meeting) => meeting.date === date.toISOString().split("T")[0]
                  );
                  if (sameDayMeetings.length > 0) {

                    const isPast = date < new Date();
                    const dotColor = isPast ? "text-gray-400" : "text-blue-500";
                    return <span className={`${dotColor} font-bold`}>●</span>;
                  }
                }
                return null;
              }}
              className="mx-auto border rounded-lg p-4 shadow-sm"
            />

            {selectedMeetings.length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">Meetings on {format(selectedDate ?? new Date(), "MMM dd")}:</h2>
                {selectedMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-col bg-blue-50 p-3 mb-2 rounded-md border-l-4 border-blue-500"
                  >
                    <strong className="text-gray-700">{m.title}</strong>
                    <span className="text-gray-600 text-sm">
                      <ClockIcon className="inline-block w-4 h-4 mr-1" />
                      {m.time}
                    </span>
                    <span className="text-gray-600 text-sm">
                      <MapPinIcon className="inline-block w-4 h-4 mr-1 text-red-500" />
                      {m.location}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
