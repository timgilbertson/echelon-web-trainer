import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "../App.js";
import StravaRedirect from "../components/stravaRedirect";
import FreeRide from "../components/userLanding";

class AppRouter extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div className="main">
          <Routes>
            <Route path="/" element={<App />} exact={true} />
            <Route path="/redirect/*" element={<StravaRedirect />} />
            <Route path="/userlanding" element={<FreeRide />} />
          </Routes>
        </div>
      </BrowserRouter>
    );
  }
}
export default AppRouter;
