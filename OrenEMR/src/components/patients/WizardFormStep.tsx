import React, { ReactNode } from 'react';

interface WizardFormStepProps {
  title: string;
  children: ReactNode;
  isActive: boolean;
  spanishTitle?: string;
}

const WizardFormStep: React.FC<WizardFormStepProps> = ({ 
  title, 
  children, 
  isActive,
  spanishTitle 
}) => {
  if (!isActive) return null;
  
  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {spanishTitle && (
          <p className="text-sm text-gray-500 italic mt-1">{spanishTitle}</p>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default WizardFormStep;