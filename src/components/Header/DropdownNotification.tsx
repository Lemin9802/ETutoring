import { useState } from "react";
import ClickOutside from "@/components/ClickOutside";

type Notification = {
  id: number;
  text: string;
  date: string;
  isRead: boolean;
  details: string;
};

const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      text: "Edit your information in a swipe",
      date: "12 May, 2025",
      isRead: false,
      details:
        "Subject: Important Update on New Developments in Education Programs and Services Dear [Recipient's Name], I hope this email finds you well. First of all, we would like to express our sincere gratitude for your continued trust and support in our educational services. We are pleased to share several important updates regarding new developments in our programs, policies, and initiatives that are designed to enhance your educational experience with us. 1. Introduction of New Educational Programs We are excited to announce the launch of new educational programs starting from [Start Date]. These programs have been carefully designed to meet the evolving needs of students and professionals, offering cutting-edge learning opportunities in areas such as [Program Areas]. With these new additions, we aim to provide students with a more comprehensive and diverse learning experience that equips them with the skills required for success in today’s competitive world. To help you get the most out of these programs, we have also introduced flexible learning options including online courses, blended learning, and interactive workshops. For more details about our new courses and enrollment procedures, please visit our website or contact our academic support team directly. 2. Exclusive Scholarships and Financial Aid Opportunities As part of our commitment to making education accessible to all, we are pleased to offer several scholarships and financial aid options for students enrolling in our new programs. These scholarships are designed to support talented individuals who demonstrate strong academic potential but may face financial challenges. We encourage interested applicants to submit their applications before [Deadline Date] to be considered for these opportunities. Detailed information about eligibility requirements and the application process can be found on our scholarship page on our website. Our admissions team is also available to assist with any questions you may have regarding the application process. 3. Enhanced Student Support Services In our continued effort to ensure that every student has the tools and resources they need to succeed, we have expanded our student support services. We now offer personalized academic advising, career counseling, and mental health support to help students navigate their academic journey and achieve their personal and professional goals. Additionally, we have introduced a new online portal where students can easily access their course materials, track their progress, and communicate directly with faculty members. This portal will also serve as a hub for students to find valuable resources and participate in interactive discussions with their peers. 4. Changes to Course Schedules and Calendar We would like to inform you about some changes to our academic calendar and course schedules for the upcoming semester. Starting from [Start Date], the semester schedule will be adjusted to provide more flexible options for both in-person and online classes. These changes aim to better accommodate the needs of our students and ensure a balanced approach to learning. The revised schedule includes options for evening and weekend classes to better serve working students and those with other commitments. A detailed version of the new academic calendar is available on our website for your convenience. 5. Commitment to Continuous Improvement We would like to take this opportunity to thank you once again for being a part of our educational community. Your feedback and engagement have been invaluable in helping us enhance our programs and services. We remain committed to providing high-quality education and support to our students and will continue to evolve our offerings to keep pace with the latest trends in education. If you have any questions or need further information about the updates mentioned above, please do not hesitate to reach out to our customer service team. We are here to assist you in any way we can. Thank you for your ongoing support, and we look forward to continuing to serve your educational needs in the future. Warm regards, [Your Name] [Your Position] [Institution Name] [Contact Information]",
    },
    {
      id: 2,
      text: "It is a long established fact",
      date: "24 Feb, 2025",
      isRead: false,
      details:
        "Subject: Important Update on New Developments in Education Programs and Services Dear [Recipient's Name], I hope this email finds you well. First of all, we would like to express our sincere gratitude for your continued trust and support in our educational services. We are pleased to share several important updates regarding new developments in our programs, policies, and initiatives that are designed to enhance your educational experience with us. [More details...]",
    },
    {
      id: 3,
      text: "Your subscription has been activated",
      date: "05 Apr, 2025",
      isRead: false,
      details:
        "Congratulations! Your subscription to our premium service has been successfully activated. Enjoy exclusive content and features designed just for you.",
    },
    {
      id: 4,
      text: "New feature available",
      date: "10 Apr, 2025",
      isRead: false,
      details:
        "We are excited to introduce a brand new feature that will enhance your user experience. Check it out now and let us know what you think!",
    },
    {
      id: 5,
      text: "Maintenance scheduled",
      date: "15 Apr, 2025",
      isRead: false,
      details:
        "Please be advised that our system will undergo scheduled maintenance on 20 Apr, 2025. During this time, some features might be temporarily unavailable.",
    },
    {
      id: 6,
      text: "New message from support",
      date: "20 Apr, 2025",
      isRead: false,
      details:
        "Our support team has sent you a message regarding your recent inquiry. Please check your inbox for further details and instructions.",
    },
  ]);

  const unreadCount = notifications.filter((notif) => !notif.isRead).length;
  const [showAll, setShowAll] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const initialDisplayCount = 4;
  const displayedNotifications = showAll ? notifications : notifications.slice(0, initialDisplayCount);

  const markAsRead = (id: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleNotificationClick = (notif: Notification) => {
    setSelectedNotification(notif);
    markAsRead(notif.id);
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <li>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-gray-200 hover:bg-gray-300 focus:outline-none"
        >
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md">
              {unreadCount}
            </span>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path
              fillRule="evenodd"
              d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute left-1/2 transform -translate-x-1/2 sm:-translate-x-1 sm:left-auto sm:right-0 mt-2 w-80 max-w-xs md:max-w-sm lg:max-w-md rounded-lg border border-gray-300 bg-white shadow-lg">
            <div className="p-4 border-b">
              <h1 className="text-lg sm:text-xl font-medium">Notifications</h1>
            </div>
            <ul className="max-h-64 overflow-y-auto">
              {displayedNotifications.map((notif) => (
                <li key={notif.id}>
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-3 border-b text-sm ${
                      notif.isRead ? "bg-gray-100 text-gray-500" : "bg-white text-black font-semibold"
                    } hover:bg-gray-200 focus:outline-none`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <p>{notif.text}</p>
                    <p className="text-xs text-gray-400">{notif.date}</p>
                  </button>
                </li>
              ))}
            </ul>
            {notifications.length > initialDisplayCount && (
              <div className="p-4 text-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-blue-500 text-sm font-bold focus:outline-none"
                >
                  {showAll ? "Show Less" : "Show All"}
                </button>
              </div>
            )}
          </div>
        )}
      </li>

      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 py-6 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative w-full max-w-lg transform rounded-xl bg-white shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 px-4 sm:px-6 py-4 rounded-t-xl">
              <h2 className="text-lg sm:text-xl font-bold text-white">Notification Details</h2>
              <button onClick={() => setSelectedNotification(null)} className="text-white hover:text-gray-200 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 sm:h-6 w-5 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-4 sm:px-6 py-5 text-sm sm:text-base leading-relaxed text-gray-700 max-h-60 overflow-y-auto">
              {selectedNotification.details}
              <p className="mt-3 text-xs sm:text-sm text-gray-500">{selectedNotification.date}</p>
            </div>
            <div className="flex justify-end bg-gray-50 px-4 sm:px-6 py-4 rounded-b-xl">
              <button onClick={() => setSelectedNotification(null)} className="rounded-md bg-indigo-600 px-4 py-2 text-xs sm:text-sm text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownNotification;
