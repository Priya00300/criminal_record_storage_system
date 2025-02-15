import React, { useState } from 'react';

const RecordForm = () => {
  const [status, setStatus] = useState<string>('0'); // Explicitly set as string
  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Criminal Record Form</h2>
      <form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter full name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="dob">
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="crime">
            Crime Description
            </label>
          <textarea
            id="crime"
            className="w-full px-3 py-2 border rounded-lg"
            rows={4 as number}
        
            placeholder="Enter crime details"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" htmlFor="status">
            Case Status
          </label>
          <select
            id="status"
            className="w-full px-3 py-2 border rounded-lg"
            value={status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setStatus(e.target.value);
            }}
          >
            <option value="0">Pending</option>
            <option value="1">Ongoing</option>
            <option value="2">Closed</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Submit Record
        </button>
      </form>
    </div>
  );
};

export default RecordForm;
