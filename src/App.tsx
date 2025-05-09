import Router from "./routes/Router";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/layouts/AppLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <Router />
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={true}
          theme="colored"
        />
      </AppLayout>
    </AuthProvider>
  );
}

export default App;
