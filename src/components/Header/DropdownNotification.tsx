"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ClickOutside from "@/components/ClickOutside";

// Define Notification type
// This ensures type safety when handling notifications
type Notification = {
  id: string;
  subject: string;
  createdAt: string;
  isRead: boolean;
  details: string;
};

const DropdownNotification = () => {
  // State management
  const [dropdownOpen, setDropdownOpen] = useState(false); // Controls dropdown visibility
  const [notifications, setNotifications] = useState<Notification[]>([]); // Stores notifications
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error message
  const [showAll, setShowAll] = useState(false); // Toggle for showing all notifications
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null); // Stores selected notification for detail view

  // Fetch notifications from API on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.post("/api/email/email"); // API call
        console.log("📩 Raw API response:", response.data);

        // Format API response into Notification type
        if (Array.isArray(response.data)) {
          const formattedData = response.data.map((email) => ({
            id: email.Id || email.id || crypto.randomUUID(), // Ensure unique ID
            subject: email.Subject || email.subject || "No Subject",
            createdAt: email.CreatedAt || email.created_at|| "N/A",
            isRead: false,
            details: email.Body || email.body|| "No details available.",
          }));
          setNotifications(formattedData);
        } else {
          throw new Error("Invalid email data format");
        }
      } catch (error) {
        setError("⚠️ Failed to load emails");
        console.error("🚨 Error fetching emails:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Calculate unread notification count
  const unreadCount = notifications.filter((notif) => !notif.isRead).length;

  // Display initial count or all notifications
  const initialDisplayCount = 2;
  const displayedNotifications = showAll ? notifications : notifications.slice(0, initialDisplayCount);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );
  }, []);

  // Handle click to view notification details
  const handleNotificationClick = (notif: Notification) => {
    setSelectedNotification(notif);
    markAsRead(notif.id);
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      {/* Notification icon with unread badge */}
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

        {/* Notification dropdown */}
        {dropdownOpen && (
          <div className="absolute left-1/2 transform -translate-x-1/2 sm:-translate-x-1 sm:left-auto sm:right-0 mt-2 w-80 max-w-xs md:max-w-sm lg:max-w-md rounded-lg border border-gray-300 bg-white shadow-lg">
            <div className="p-4 border-b">
              <h1 className="text-lg sm:text-xl font-medium">Notifications</h1>
            </div>

            {/* Loading, error, or notifications */}
            {loading ? (
              <p className="p-4 text-gray-500 text-center">Loading...</p>
            ) : error ? (
              <p className="p-4 text-red-500 text-center">{error}</p>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No notifications available.</p>
            ) : (
              <>
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
                        <p>{notif.subject}</p>
                        <p className="text-xs text-gray-400">{notif.createdAt}</p>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Show more/less button */}
                {notifications.length > initialDisplayCount && (
                  <div className="p-2 text-center border-t">
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="text-blue-500 focus:outline-none"
                    >
                      {showAll ? "Show Less" : "Show All"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </li>

      {/* Notification details modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg transform rounded-xl bg-white shadow-xl transition-all duration-300">
            {/* Modal header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-4 rounded-t-xl">
              <h2 className="text-lg font-bold text-white">Notification Details</h2>
              <button onClick={() => setSelectedNotification(null)} className="text-white hover:text-gray-200 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body with increased text size */}
            <div className="px-6 py-5 text-lg leading-relaxed text-gray-700 max-h-60 overflow-y-auto">
              <div
                className="text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: selectedNotification.details }}
              ></div>

              <p className="mt-3 text-sm text-gray-500">{selectedNotification.createdAt}</p>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end bg-gray-50 px-6 py-4 rounded-b-xl">
              <button onClick={() => setSelectedNotification(null)} className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white font-medium hover:bg-indigo-700 focus:outline-none">
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
