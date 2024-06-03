import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "@/components/Layout";
import { useAuthContext } from "@/context/AuthContext";
import Calendar from "@/pages/Calendar";
import Document from "@/pages/Document";
import Documents from "@/pages/Documents";
import List from "@/pages/List";
import Lists from "@/pages/Lists";
import Login from "@/pages/Login";

function App() {
  const { user } = useAuthContext();
  return (
    <Router>
      {user ? (
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Calendar />} />
            <Route path="/backlog" element={<Calendar />} />
            <Route path="/backlog/:id" element={<Calendar />} />

            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:id" element={<Document />} />
            <Route path="/lists" element={<Lists />} />
            <Route path="/lists/:id" element={<List />} />
          </Route>
        </Routes>
      ) : (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
