import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <CourseProvider>
      <App />
    </CourseProvider>
  </AuthProvider>
);
