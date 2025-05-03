import Router from "./routes/Router";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/layouts/AppLayout";

function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <Router />
      </AppLayout>
    </AuthProvider>
  );
}

export default App;
