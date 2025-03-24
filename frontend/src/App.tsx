import { Routes, Route, Link, useLocation } from "react-router-dom";
import { TripList } from "./pages/TripList";
import { TripView } from "./pages/TripView";
import { CreateTrip } from "./pages/CreateTrip";
import { LocationProvider } from "./contexts/LocationContext";

function App() {
  const location = useLocation();
  const isNewTripPage = location.pathname === "/new-trip";
  return (
    <LocationProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-8xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <Link to="/" className="text-3xl font-bold text-gray-900 ">
                ELD Trip Manager
              </Link>
              {!isNewTripPage ? (
                <Link
                  to="/new-trip"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  New Trip
                </Link>
              ) : (
                <Link
                  to="/"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Back to Trips
                </Link>
              )}
            </div>

            <Routes>
              <Route path="/" element={<TripList />} />
              <Route path="/new-trip" element={<CreateTrip />} />
              <Route path="/trips/:id" element={<TripView />} />
            </Routes>
          </div>
        </div>
      </div>
    </LocationProvider>
  );
}

export default App;
