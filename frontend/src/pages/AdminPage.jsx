import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';

const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [businessRegistrations, setBusinessRegistrations] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'users': {
          const usersResponse = await apiClient.getAllUsers();
          if (usersResponse.success) {
            setUsers(usersResponse.data);
          }
          break;
        }
        case 'business': {
          const businessResponse = await apiClient.getAllBusinessRegistrations();
          if (businessResponse.success) {
            setBusinessRegistrations(businessResponse.data);
          }
          break;
        }
        case 'support': {
          const supportResponse = await apiClient.getAllSupportTickets();
          if (supportResponse.success) {
            setSupportTickets(supportResponse.data);
          }
          break;
        }
      }
    } catch (error) {
      // Data loading error handling removed for production
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessStatus = async (id, status) => {
    try {
      const response = await apiClient.updateBusinessStatus(id, status);
      if (response.success) {
        loadData(); // Reload data
      }
    } catch (error) {
      // Status update error handling removed for production
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.firstName}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{users.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Business Registrations</h3>
              <p className="text-3xl font-bold text-green-600">{businessRegistrations.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
              <p className="text-3xl font-bold text-yellow-600">{supportTickets.length}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'users', label: 'Users', icon: '👥' },
                  { id: 'business', label: 'Business Registrations', icon: '🏢' },
                  { id: 'support', label: 'Support Tickets', icon: '🎫' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Users Tab */}
                  {activeTab === 'users' && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {users.map(user => (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                {user.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Business Registrations Tab */}
                  {activeTab === 'business' && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {businessRegistrations.map(registration => (
                            <tr key={registration.id}>
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {registration.business_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                {registration.business_type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  registration.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  registration.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {registration.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <select
                                  value={registration.status}
                                  onChange={(e) => updateBusinessStatus(registration.id, e.target.value)}
                                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="under_review">Under Review</option>
                                  <option value="approved">Approved</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Support Tickets Tab */}
                  {activeTab === 'support' && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {supportTickets.map(ticket => (
                            <tr key={ticket.id}>
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {ticket.subject}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                {ticket.email || 'Anonymous'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  ticket.priority === 'high' || ticket.priority === 'urgent' 
                                    ? 'bg-red-100 text-red-800' 
                                    : ticket.priority === 'medium' 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {ticket.priority}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                  ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {ticket.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                {new Date(ticket.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminPage;