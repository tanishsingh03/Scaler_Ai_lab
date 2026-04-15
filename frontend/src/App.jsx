import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Events from "./pages/Events";
import BookingPage from "./pages/BookingPage";
import Meetings from "./pages/Meetings";
import Availability from "./pages/Availability";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import Success from "./pages/Success";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes - Wrapped in Layout (shows Navbar) */}
        <Route path="/" element={<Layout><Events /></Layout>} />
        <Route path="/availability" element={<Layout><Availability /></Layout>} />
        <Route path="/meetings" element={<Layout><Meetings /></Layout>} />
        <Route path="/event-types/new" element={<Layout><CreateEvent /></Layout>} />
        <Route path="/event-types/:id/edit" element={<Layout><EditEvent /></Layout>} />

        {/* Public Routes - No Layout/Navbar */}
        <Route path="/:username/:slug" element={<BookingPage />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;