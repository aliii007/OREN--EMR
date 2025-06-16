import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTask } from '../../contexts/TaskContext';
import axios from 'axios';
import { toast } from 'react-toastify';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

const TaskForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { createTask, updateTask, getTaskById } = useTask();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    patient: '',
    relatedVisit: '',
    relatedNote: ''
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  
  // Fetch users and patients when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch users
        const usersResponse = await axios.get('http://localhost:5000/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
        
        // Fetch doctors
        const doctorsResponse = await axios.get('http://localhost:5000/api/auth/doctors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDoctors(Array.isArray(doctorsResponse.data) ? doctorsResponse.data : []);
        
        // Fetch patients
        const patientsResponse = await axios.get('http://localhost:5000/api/patients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const patientsData = Array.isArray(patientsResponse.data) ? patientsResponse.data : [];
        setPatients(patientsData);
        setFilteredPatients(patientsData);
        
        // If in edit mode, fetch task details
        if (isEditMode && id) {
          const task = await getTaskById(id);
          if (task) {
            setFormData({
              title: task.title || '',
              description: task.description || '',
              priority: task.priority || 'medium',
              dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
              assignedTo: task.assignedTo?._id || '',
              patient: task.patient?._id || '',
              relatedVisit: task.relatedVisit || '',
              relatedNote: task.relatedNote || ''
            });
          }
        } else {
          // In create mode, set current user as default assignee
          setFormData(prev => ({
            ...prev,
            assignedTo: user?.id || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load form data. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [token, id, isEditMode, getTaskById, user]);
  
  // Filter patients based on search term
  useEffect(() => {
    if (!Array.isArray(patients)) {
      setFilteredPatients([]);
      return;
    }
    
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      });
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
      };
      
      if (isEditMode && id) {
        await updateTask(id, taskData);
        toast.success('Task updated successfully');
      } else {
        await createTask(taskData);
        toast.success('Task created successfully');
      }
      
      navigate('/tasks');
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="loader"></div></div>;
  }
  
  // Add error handling for empty data
  const hasPatients = Array.isArray(filteredPatients) && filteredPatients.length > 0;
  const hasDoctors = Array.isArray(doctors) && doctors.length > 0;
  
  // Render with error boundary
  try {
    // Debug information (can be removed in production)
    console.log('Rendering TaskForm with:', { 
      patientsCount: Array.isArray(patients) ? patients.length : 0,
      filteredPatientsCount: Array.isArray(filteredPatients) ? filteredPatients.length : 0,
      doctorsCount: Array.isArray(doctors) ? doctors.length : 0,
      formData
    });
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">{isEditMode ? 'Edit Task' : 'Create New Task'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Task Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task title"
              />
            </div>
            
            {/* Description */}
            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task description"
              ></textarea>
            </div>
            
            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority*</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority || 'medium'}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Assigned To */}
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">Assigned To*</label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select User</option>
                {Array.isArray(doctors) && doctors.length > 0 ? (
                  doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.firstName} {doctor.lastName} ({doctor.username})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No doctors available</option>
                )}
              </select>
              {!hasDoctors && <p className="mt-1 text-sm text-red-500">No doctors found in the system.</p>}
            </div>
            
            {/* Patient Search */}
            <div>
              <label htmlFor="patientSearch" className="block text-sm font-medium text-gray-700 mb-1">Search Patient</label>
              <input
                type="text"
                id="patientSearch"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by patient name"
              />
            </div>
            
            {/* Patient Selection */}
            <div className="col-span-2">
              <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-1">Patient*</label>
              <select
                id="patient"
                name="patient"
                value={formData.patient}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Patient</option>
                {Array.isArray(filteredPatients) && filteredPatients.length > 0 ? (
                  filteredPatients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName} (DOB: {patient.dateOfBirth})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No patients available</option>
                )}
              </select>
              {!hasPatients && <p className="mt-1 text-sm text-red-500">No patients found. Please add patients first.</p>}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    );
  } catch (error) {
    console.error('Error rendering TaskForm:', error);
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6 text-red-600">Error Loading Form</h2>
        <p>There was an error loading the task form. Please try refreshing the page.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Page
        </button>
      </div>
    );
  }
};

export default TaskForm;