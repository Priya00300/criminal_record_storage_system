import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard.tsx";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
import RecordForm from "./components/RecordForm.tsx";
import RecordList from "./components/RecordList.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/records" element={<RecordList />} />
        <Route path="/records/new" element={<RecordForm />} />
        <Route path="/records/edit/:id" element={<RecordForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
