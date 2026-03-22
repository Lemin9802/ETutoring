# ETutoring - Client Application

This module contains the frontend architecture for the ETutoring platform. It is engineered to handle complex client-side state management and deliver a highly interactive user experience without compromising on performance.

### Technical Highlights
* **Meeting Calendar Engine:** Designed and programmed a custom calendar interface from the ground up to handle dynamic rendering of tutoring sessions, date-time logical processing, and asynchronous state updates.
* **Timeline Visualization:** Built an intricate Timeline UI component to visually map out user activities and session progressions, requiring strict management of data flow and component lifecycles.
* **Tutor Dashboard Integration:** Developed a cohesive dashboard ecosystem that seamlessly aggregates data from multiple backend endpoints, presenting it through an intuitive and responsive design architecture.
* **Robust Error Handling:** Implemented comprehensive client-side validation and fallback UI mechanisms to ensure uninterrupted workflows during network latency or API constraints.

### Local Environment Setup

To deploy the frontend locally, ensure Node.js is installed on your system. Navigate into the frontend directory, install all required dependencies, set up your environment variables to point to the local backend API, and start the development server. You can execute the following commands sequentially in your terminal to initialize the environment and run the application at `http://localhost:3000`:

```bash
cd Front-end
npm install
echo "REACT_APP_API_BASE_URL=https://localhost:5001/api" > .env
echo "REACT_APP_GOOGLE_CLIENT_ID=your_client_id" >> .env
npm start
