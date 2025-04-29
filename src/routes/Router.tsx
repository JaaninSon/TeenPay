import { BrowserRouter, Routes, Route } from "react-router-dom";
// import LoginScreen from "../pages/LoginScreen";

function Router() {
  return (
    <BrowserRouter>
      <Routes>{/* <Route path="/login" element={<LoginScreen />} /> */}</Routes>
    </BrowserRouter>
  );
}

export default Router;
