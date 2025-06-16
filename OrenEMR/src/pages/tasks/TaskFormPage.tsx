import React from 'react';
import { Link, useParams } from 'react-router-dom';
import TaskForm from '../../components/tasks/TaskForm';
import { FaArrowLeft } from 'react-icons/fa';

const TaskFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          to="/tasks"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Back to Tasks
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Task' : 'Create New Task'}
        </h1>
      </div>
      
      <TaskForm />
    </div>
  );
};

export default TaskFormPage;