import React from 'react';

const RecordList = () => {
  // Temporary data - will be replaced with API calls
  const records = [
    { id: 1, name: 'John Doe', crime: 'Theft', status: 'Pending' },
    { id: 2, name: 'Jane Smith', crime: 'Fraud', status: 'Ongoing' },
    { id: 3, name: 'Bob Johnson', crime: 'Burglary', status: 'Closed' }
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Criminal Records</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crime</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap">{record.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.crime}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    record.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-500 hover:text-blue-700 mr-2">View</button>
                  <button className="text-green-500 hover:text-green-700 mr-2">Edit</button>
                  <button className="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecordList;
