import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionnairesSection from '../../components/forms/QuestionnairesSection';

const QuestionnairesPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Sample data for questionnaires
  const questionnaires = [
    {
      id: 'new-patient-form',
      title: 'New Patient Form',
      color: 'bg-purple-500',
      isShared: true
    },
    {
      id: 'dash-score',
      title: 'Dash Score',
      color: 'bg-yellow-500',
      isShared: true
    },
    {
      id: 'new-patient-personal-injury',
      title: 'New Patient Personal Injury',
      color: 'bg-blue-500',
      isShared: true
    },
    {
      id: 'new-patient-workers-compensation',
      title: 'New Patient Workers Compensation',
      color: 'bg-green-500',
      isShared: true
    },
    {
      id: 'carecredit-optional-finance-option',
      title: 'CareCredit Optional Finance Option',
      color: 'bg-red-500',
      isShared: true
    }
  ];
  
  // Sample data for consent forms
  const consentForms = [
    {
      id: 'assignment-of-benefits',
      title: 'Assignment Of Benefits',
      color: 'bg-purple-500',
      isShared: true
    },
    {
      id: 'no-show-policy-financial-responsibilities-agreement-spanish',
      title: 'No Show Policy & Financial Responsibilities Agreement Spanish',
      color: 'bg-yellow-500',
      isShared: true
    },
    {
      id: 'medicare-private-contract',
      title: 'Medicare Private Contract',
      color: 'bg-blue-500',
      isShared: true
    },
    {
      id: 'designation-of-authorized-representative',
      title: 'Designation Of Authorized Representative',
      color: 'bg-green-500',
      isShared: true,
      isPdf: true
    },
    {
      id: 'bactrim-consent',
      title: 'Bactrim Consent',
      color: 'bg-red-500',
      isShared: true
    },
    {
      id: 'bactrim-consent-spanish',
      title: 'Bactrim Consent Spanish',
      color: 'bg-purple-500',
      isShared: true
    },
    {
      id: 'assignment-of-benefits-spanish',
      title: 'Assignment Of Benefits - Spanish',
      color: 'bg-yellow-500',
      isShared: true
    },
    {
      id: 'no-show-policy-financial-responsibilities-agreement',
      title: 'No Show Policy & Financial Responsibilities Agreement',
      color: 'bg-blue-500',
      isShared: true
    },
    {
      id: 'no-show-policy-spanish',
      title: 'No Show Policy Spanish',
      color: 'bg-green-500',
      isShared: true
    }
  ];

  const handleFormClick = (formId: string) => {
    // Handle form click - navigate to form or open it
    console.log(`Form clicked: ${formId}`);
    
    // If the clicked form is the New Patient Form, navigate to the add patient page
    if (formId === 'new-patient-form') {
      navigate('/patients/new');
    } else {
      // For other forms, we'll implement this later
      // navigate(`/forms/${formId}`);
    }
  };

  const handleCreateNew = () => {
    // Handle create new form
    console.log('Create new form clicked');
    // navigate('/forms/create');
  };

  const handleUploadExisting = () => {
    // Handle upload existing form
    console.log('Upload existing form clicked');
    // navigate('/forms/upload');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Questionnaires Section */}
      <QuestionnairesSection
        title="Questionnaires"
        forms={questionnaires}
        onFormClick={handleFormClick}
        onCreateNew={handleCreateNew}
        onUploadExisting={handleUploadExisting}
      />
      
      {/* Consent Forms Section */}
      <QuestionnairesSection
        title="Consent Forms"
        forms={consentForms}
        onFormClick={handleFormClick}
        onCreateNew={handleCreateNew}
        onUploadExisting={handleUploadExisting}
      />
    </div>
  );
};

export default QuestionnairesPage;