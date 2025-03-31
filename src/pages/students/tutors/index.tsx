// pages/tutors.tsx
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Tutor {
  tutor_id: string;
  full_name: string;
  address: string;
  phone_number: string;
  email: string;
  user_name: string;
}

interface APIResponse {
  success: boolean;
  message: string;
  data: Tutor[];
  errors?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

const TutorsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination options (if needed)
  const [pageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  useEffect(() => {
    const fetchTutors = async () => {
      if (!session || status !== "authenticated") return;

      try {
        const response = await fetch("/api/students/get-tutors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: session.user.id, // using student_id from session
            page_number: pageNumber,
            page_size: pageSize,
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to load tutors data.");
        }

        const result: APIResponse = await response.json();
        if (result.success && result.data) {
          setTutors(result.data);
        } else {
          setError(result.message || "No tutors found.");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "An error occurred.");
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [session, status, pageNumber, pageSize]);

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Please log in to view tutors information.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Tutors List</h1>

      {/* Table display for tutors */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              {/* STT Column */}
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No.
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
            </tr>
          </thead>
          <tbody>
            {tutors.map((tutor, index) => (
              <tr key={tutor.tutor_id}>
                {/* Display row index (STT) */}
                <td className="px-6 py-4 border-b whitespace-nowrap">{index + 1}</td>
                <td className="px-6 py-4 border-b whitespace-nowrap">{tutor.full_name}</td>
                <td className="px-6 py-4 border-b whitespace-nowrap">{tutor.user_name}</td>
                <td className="px-6 py-4 border-b whitespace-nowrap">{tutor.email}</td>
                <td className="px-6 py-4 border-b whitespace-nowrap">{tutor.address}</td>
                <td className="px-6 py-4 border-b whitespace-nowrap">{tutor.phone_number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TutorsPage;
