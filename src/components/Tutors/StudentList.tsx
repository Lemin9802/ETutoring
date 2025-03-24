import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Avatar,
  Tag,
  Pagination,
  Spin,
  Empty,
  Select,
  DatePicker,
  Button,
  Collapse,
  message,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { Student } from "@/types/Students";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { RangePickerProps } from "antd/es/date-picker";
import axios from "axios";
import { APIResponse } from "@/types/APIResponse";

dayjs.extend(relativeTime);

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

interface StudentListProps {
  pageSize: number;
}

interface FilterOptions {
  loginDateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
  status: "all" | "active" | "inactive";
  gender: string | null;
  nationality: string | null;
}

const StudentList: React.FC<StudentListProps> = ({ pageSize = 10 }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize,
    total: 0,
  });
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [filters, setFilters] = useState<FilterOptions>({
    loginDateRange: null,
    status: "all",
    gender: null,
    nationality: null,
  });
  const [fetchParams, setFetchParams] = useState({
    page: 1,
    size: pageSize,
    searchTerm: "",
    currentFilters: {
      loginDateRange: null,
      status: "all",
      gender: null,
      nationality: null,
    } as FilterOptions,
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { page, size, searchTerm, currentFilters } = fetchParams;

      const response = await axios.post("/api/tutors/get-students", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page,
          size,
          search: searchTerm,
          filters: {
            loginDateRange: currentFilters.loginDateRange
              ? [
                  currentFilters.loginDateRange[0]?.toISOString(),
                  currentFilters.loginDateRange[1]?.toISOString(),
                ]
              : null,
            status: currentFilters.status,
            gender: currentFilters.gender,
            nationality: currentFilters.nationality,
          },
        }),
      });
      console.log("response.stat", response.status);
      if (response.status !== 200) {
        message.error({
          content: response.data.message,
          key: "students-fetch-error",
          duration: 3,
        });
        return;
      }

      const data: APIResponse = await response.data;
      setStudents(data.data);
      setPagination({
        current: data.meta.page_number,
        pageSize: data.meta.page_size,
        total: data.meta.total_items,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        message.error({
          content:
            error.response?.data?.message ||
            "An error occurred while fetching students",
          key: "students-fetch-error",
          duration: 3,
        });
      } else {
        message.error({
          content: "An error occurred while fetching students",
          key: "students-fetch-error",
          duration: 3,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchStudents();
  }, [fetchParams]);

  // Debounced search and filters handling
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setFetchParams((prev) => ({
        ...prev,
        page: 1, // Reset to first page on search/filter change
        searchTerm: search,
        currentFilters: filters,
      }));
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [search, filters]);

  const handlePageChange = (page: number, pageSize?: number) => {
    setFetchParams((prev) => ({
      ...prev,
      page,
      size: pageSize || prev.size,
    }));
  };

  const handleFilterChange = (name: keyof FilterOptions, value: string | [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    // No need to call fetchStudents here as the useEffect will handle it
  };

  const handleClearFilters = () => {
    const resetFilters: FilterOptions = {
      loginDateRange: null,
      status: "all",
      gender: null,
      nationality: null,
    };
    setFilters(resetFilters);
    // No need to call fetchStudents here as the useEffect will handle it
  };

  // Disallow selecting future dates for the login date filter
  const disabledDate: RangePickerProps["disabledDate"] = (current) => {
    return current && current > dayjs().endOf("day");
  };

  const columns = [
    {
      title: "Student",
      dataIndex: "full_name",
      key: "full_name",
      render: (text: string, record: Student) => (
        <div className="flex items-center space-x-3">
          <Avatar
            src={record.profile_picture}
            icon={<UserOutlined />}
            size="large"
          />
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "phone_number",
      key: "phone_number",
      render: (text: string) => text || "-",
    },
    {
      title: "Last Login",
      dataIndex: "last_login_time",
      key: "last_login_time",
      render: (date: string) =>
        date ? (
          <div className="flex items-center">
            <ClockCircleOutlined className="mr-1 text-gray-400" />
            <span>{dayjs(date).fromNow()}</span>
          </div>
        ) : (
          "Never"
        ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, record: Student) => {
        // Determine status based on last login (active if logged in within the last 7 days)
        const lastLogin = record.last_login_time
          ? dayjs(record.last_login_time)
          : null;
        const isActive = lastLogin && dayjs().diff(lastLogin, "day") < 7;

        return (
          <Tag color={isActive ? "green" : "volcano"}>
            {isActive ? "Active" : "Inactive"}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: Student) => (
        <div className="flex space-x-2">
          <a
            href={`/tutors/students/${record.id}`}
            className="text-blue-500 hover:text-blue-700"
          >
            View Profile
          </a>
          <span className="text-gray-300">|</span>
          <a
            href={`/messages?studentId=${record.id}`}
            className="text-green-500 hover:text-green-700"
          >
            Message
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-5 rounded-lg shadow">
      <div className="mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <Input
            placeholder="Search students by name or email"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96"
            size="large"
            allowClear
          />

          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={() => {}}
            className="w-full md:w-auto"
          >
            Filters
          </Button>
        </div>

        <Collapse ghost className="bg-gray-50 rounded-lg px-2">
          <Panel header="Filter Options" key="1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="mb-1 font-medium">Last Login Period</div>
                <RangePicker
                  style={{ width: "100%" }}
                  value={filters.loginDateRange as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null}
                  onChange={(dates) =>
                    handleFilterChange("loginDateRange", dates)
                  }
                  disabledDate={disabledDate}
                  placeholder={["Start date", "End date"]}
                />
              </div>

              <div>
                <div className="mb-1 font-medium">Status</div>
                <Select
                  style={{ width: "100%" }}
                  value={filters.status}
                  onChange={(value) => handleFilterChange("status", value)}
                >
                  <Option value="all">All Students</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </div>

              <div>
                <div className="mb-1 font-medium">Gender</div>
                <Select
                  style={{ width: "100%" }}
                  value={filters.gender}
                  onChange={(value) => handleFilterChange("gender", value)}
                  allowClear
                  placeholder="Select gender"
                >
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                </Select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </Panel>
        </Collapse>

        {(filters.loginDateRange ||
          filters.status !== "all" ||
          filters.gender ||
          filters.nationality) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {filters.loginDateRange && (
              <Tag
                closable
                onClose={() => handleFilterChange("loginDateRange", null)}
              >
                Login: {dayjs(filters.loginDateRange[0]).format("MMM D")} -{" "}
                {dayjs(filters.loginDateRange[1]).format("MMM D")}
              </Tag>
            )}
            {filters.status !== "all" && (
              <Tag closable onClose={() => handleFilterChange("status", "all")}>
                Status: {filters.status}
              </Tag>
            )}
            {filters.gender && (
              <Tag closable onClose={() => handleFilterChange("gender", null)}>
                Gender: {filters.gender}
              </Tag>
            )}
            {filters.nationality && (
              <Tag
                closable
                onClose={() => handleFilterChange("nationality", null)}
              >
                Nationality: {filters.nationality}
              </Tag>
            )}
          </div>
        )}
      </div>

      <Spin spinning={loading} tip="Loading students...">
        {students.length > 0 ? (
          <>
            <Table
              columns={columns}
              dataSource={students.map((student) => ({
                ...student,
                key: student.id,
              }))}
              pagination={false}
              className="mb-5"
              rowClassName="hover:bg-gray-50 transition-colors"
            />
            <div className="flex justify-between items-center mt-4">
              {students.length > 0 && (
                <div className="text-gray-500">
                  {(filters.loginDateRange ||
                    filters.status !== "all" ||
                    filters.gender ||
                    filters.nationality) && (
                    <span>Filtered results: {pagination.total} students</span>
                  )}
                </div>
              )}
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => `Total ${total} students`}
              />
            </div>
          </>
        ) : (
          <Empty
            description={
              <span className="text-gray-500">
                {search ||
                filters.loginDateRange ||
                filters.status !== "all" ||
                filters.gender ||
                filters.nationality
                  ? "No students match your search criteria or filters"
                  : "No students found"}
              </span>
            }
          />
        )}
      </Spin>
    </div>
  );
};

export default StudentList;
