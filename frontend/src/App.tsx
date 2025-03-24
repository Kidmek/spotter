import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { TripList } from "./pages/TripList";
import { TripView } from "./pages/TripView";
import { CreateTrip } from "./pages/CreateTrip";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                ELD Trip Manager
              </h1>
              <Link
                to="/new-trip"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                New Trip
              </Link>
            </div>

            <Routes>
              <Route path="/" element={<TripList />} />
              <Route path="/new-trip" element={<CreateTrip />} />
              <Route path="/trips/:id" element={<TripView />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
