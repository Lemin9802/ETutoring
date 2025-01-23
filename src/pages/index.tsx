import { Timeline } from "antd";

export default function Home() {
  return (
    <div className="container h-screen mx-auto p-4 flex justify-center items-center">
      <Timeline
        items={[
          {
            children: "Design database 2025-01-23",
          },
          {
            children: "Solve initial network problems 2015-09-01",
          },
          {
            children: "Technical testing 2015-09-01",
          },
          {
            children: "Network problems being solved 2015-09-01",
          },
        ]}
      />
    </div>
  );
}
