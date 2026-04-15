import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Events from "./pages/Events";
import BookingPage from "./pages/BookingPage";
import Meetings from "./pages/Meetings";
import Availability from "./pages/Availability";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import Success from "./pages/Success";
import DateOverrides from "./pages/DateOverrides";
import Reschedule from "./pages/Reschedule";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes — wrapped in Layout (shows Navbar + top header) */}
        <Route path="/" element={<Layout><Events /></Layout>} />
        <Route path="/availability" element={<Layout><Availability /></Layout>} />
        <Route path="/meetings" element={<Layout><Meetings /></Layout>} />
        <Route path="/event-types/new" element={<Layout><CreateEvent /></Layout>} />
        <Route path="/event-types/:id/edit" element={<Layout><EditEvent /></Layout>} />
        <Route path="/date-overrides" element={<Layout><DateOverrides /></Layout>} />

        {/* Public Routes — no Layout/Navbar */}
        <Route path="/:username/:slug" element={<BookingPage />} />
        <Route path="/success" element={<Success />} />
        <Route path="/reschedule/:token" element={<Reschedule />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;