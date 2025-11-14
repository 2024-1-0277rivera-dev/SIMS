
import React, { useEffect, useState } from 'react';
import Card from '../components/Card.tsx';
import Button from '../components/Button.tsx';
import { UserRole, User } from '../types.ts';
import { getUsers, updateUserRole } from '../services/api.ts';
import { useToast } from '../hooks/useToast.ts';

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
      fetchUsers();
  }, []);

  const fetchUsers = async () => {
      try {
          const fetchedUsers = await getUsers();
          setUsers(fetchedUsers);
      } catch (error) {
          addToast('Failed to fetch users', 'error');
      }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
      try {
          await updateUserRole(userId, newRole);
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
          addToast('User role updated successfully', 'success');
      } catch (error) {
          addToast('Failed to update user role', 'error');
      }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Admin Panel</h1>
      <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">User Management</h2>
          </div>
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Current Role</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Assign Role</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 capitalize">
                                    {user.role.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <select 
                                    value={user.role} 
                                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                    className="text-xs py-1 px-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-slate-300 focus:outline-none"
                                >
                                    <option value={UserRole.USER}>User</option>
                                    <option value={UserRole.TEAM_LEAD}>Team Lead</option>
                                    <option value={UserRole.OFFICER}>Officer</option>
                                    <option value={UserRole.ADMIN}>Admin</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
      </Card>
    </div>
  );
};

export default Admin;
