import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import RecordForm from "./components/RecordForm";
import RecordList from "./components/RecordList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/records" element={<RecordList />} />
        <Route path="/records/new" element={<RecordForm />} />
        <Route path="/records/edit/:id" element={<RecordForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;