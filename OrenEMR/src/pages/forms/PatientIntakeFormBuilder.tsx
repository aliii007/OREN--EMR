import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ArrowLeft, Plus, Send, Eye, Save, ChevronUp, ChevronDown, Trash2, Copy, MoreHorizontal } from 'lucide-react';

interface FormItem {
  id: string;
  type: string;
  questionText: string;
  isRequired: boolean;
  options?: string[];
  placeholder?: string;
  instructions?: string;
  multipleLines?: boolean;
  demographicFields?: {
    fieldName: string;
    fieldType: string;
    required: boolean;
    options?: string[];
  }[];
  insuranceFields?: {
    fieldName: string;
    fieldType: string;
    required: boolean;
    options?: string[];
  }[];
  matrix?: {
    rowHeader?: string;
    columnHeaders: string[];
    columnTypes: string[];
    rows: string[];
    dropdownOptions: string[][];
    displayTextBox: boolean;
  };
}

interface FormTemplate {
  _id?: string;
  title: string;
  description: string;
  isActive: boolean;
  isPublic: boolean;
  language: string;
  items: FormItem[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

const PatientIntakeFormBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formTemplate, setFormTemplate] = useState<FormTemplate>({
    title: 'New Patient Intake Form',
    description: 'Standard intake form for new patients',
    isActive: true,
    isPublic: true,
    language: 'english',
    items: []
  });
  
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [previewStep, setPreviewStep] = useState(0);
  
  // Fetch form template if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchFormTemplate();
    } else {
      // Create a default form with the required questions
      createDefaultForm();
    }
  }, [isEditMode, id]);
  
  const fetchFormTemplate = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/form-templates/${id}`);
      setFormTemplate(response.data);
      
      // Select the first item if there are any
      if (response.data.items.length > 0) {
        setCurrentItemIndex(0);
      }
    } catch (error) {
      console.error('Error fetching form template:', error);
      toast.error('Failed to load form template');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createDefaultForm = () => {
    // Create a form with all the required questions
    const defaultItems: FormItem[] = [
      {
        id: 'q1',
        type: 'blank',
        questionText: 'Language Preference',
        isRequired: true,
        multipleLines: false
      },
      {
        id: 'q2',
        type: 'blank',
        questionText: 'Who referred you? Which hospital, clinic, urgent care and/or medical provider?',
        isRequired: true,
        multipleLines: true
      },
      {
        id: 'q3',
        type: 'blank',
        questionText: 'Who referred you? Which hospital, clinic, urgent care and/or medical provider? ¿Es usted un paciente nuevo o ya establecido en Hand, Nerve & Microsurgery PC?',
        isRequired: true,
        multipleLines: true
      },
      {
        id: 'q4',
        type: 'blank',
        questionText: 'Please enter your information.',
        isRequired: true,
        multipleLines: false
      },
      {
        id: 'q5',
        type: 'blank',
        questionText: 'Please enter your information. Por favor, introduzca su información.',
        isRequired: true,
        multipleLines: false
      },
      {
        id: 'q6',
        type: 'blank',
        questionText: 'Do you have medical insurance?',
        isRequired: true,
        multipleLines: false
      },
      {
        id: 'q7',
        type: 'blank',
        questionText: 'Do you have medical insurance? ¿Tiene seguro médico?',
        isRequired: true,
        multipleLines: false
      },
      {
        id: 'q8',
        type: 'primaryInsurance',
        questionText: 'Primary Insurance',
        isRequired: true,
        instructions: 'Please provide your primary insurance details.',
        insuranceFields: [
          { fieldName: 'Insurance Company', fieldType: 'text', required: true },
          { fieldName: 'Policy Number', fieldType: 'text', required: true },
          { fieldName: 'Group Number', fieldType: 'text', required: false },
          { fieldName: 'Policyholder Name', fieldType: 'text', required: true },
          { fieldName: 'Relationship to Policyholder', fieldType: 'dropdown', required: true, options: ['Self', 'Spouse', 'Child', 'Other'] }
        ]
      },
      {
        id: 'q9',
        type: 'primaryInsurance',
        questionText: 'Primary Insurance Seguro Primario',
        isRequired: true,
        instructions: 'Please provide your primary insurance details.',
        insuranceFields: [
          { fieldName: 'Insurance Company', fieldType: 'text', required: true },
          { fieldName: 'Policy Number', fieldType: 'text', required: true },
          { fieldName: 'Group Number', fieldType: 'text', required: false },
          { fieldName: 'Policyholder Name', fieldType: 'text', required: true },
          { fieldName: 'Relationship to Policyholder', fieldType: 'dropdown', required: true, options: ['Self', 'Spouse', 'Child', 'Other'] }
        ]
      },
      {
        id: 'q10',
        type: 'blank',
        questionText: 'Please capture a high-resolution image of the front side of your government issued identification card by positioning it on a level surface. Ensure the card occupies the majority of the camera\'s viewfinder to enhance readability.',
        isRequired: true,
        multipleLines: true
      },
      // Add all the remaining questions from the list
      {
        id: 'q11',
        type: 'blank',
        questionText: 'Please capture a high-resolution image of the front side of your government issued identification card by positioning it on a level surface. Ensure the card occupies the majority of the camera\'s viewfinder to enhance readability. Por favor, tome una imagen en alta resolución de la parte frontal de su tarjeta de identificación emitida por el gobierno, colocándola en una superficie nivelada. Asegúrese de que la tarjeta ocupe la mayor parte del visor de la cámara para mejorar la legibilidad.',
        isRequired: true,
        multipleLines: true
      },
      {
        id: 'q12',
        type: 'blank',
        questionText: 'Please capture a high-resolution image of the front side and backside of your health insurance card by positioning it on a level surface. Ensure the card occupies the majority of the camera\'s viewfinder to enhance readability.',
        isRequired: true,
        multipleLines: true
      },
      {
        id: 'q13',
        type: 'blank',
        questionText: 'Please capture a high-resolution image of the front side and backside of your health insurance card by positioning it on a level surface. Ensure the card occupies the majority of the camera\'s viewfinder to enhance readability. Por favor, tome una imagen en alta resolución de ambos lados (frontal y posterior) de su tarjeta de seguro de salud, colocándola en una superficie nivelada. Asegúrese de que la tarjeta ocupe la mayor parte del visor de la cámara para mejorar la legibilidad.',
        isRequired: true,
        multipleLines: true
      },
      {
        id: 'q14',
        type: 'blank',
        questionText: 'Please capture a high-resolution image of your auto insurance card by positioning it on a level surface. Ensure the card occupies the majority of the camera\'s viewfinder to enhance readability. Por favor, tome una imagen en alta resolución de su tarjeta de seguro de automóvil, colocándola en una superficie nivelada. Asegúrese de que la tarjeta ocupe la mayor parte del visor de la cámara para mejorar la legibilidad.',
        isRequired: true,
        multipleLines: true
      },
      {
        id: 'q15',
        type: 'blank',
        questionText: 'Hand Dominance, Occupation, Hobbies',
        isRequired: true,
        multipleLines: false
      },
      {
        id: 'q16',
        type: 'blank',
        questionText: 'Hand Dominance, Occupation, Hobbies Dominancia Manual, Ocupación, Aficiones',
        isRequired: true,
        multipleLines: false
      },
      {
        id: 'q17',
        type: 'blank',
        questionText: 'Is this visit for an established problem or a new problem?',
        isRequired: true,
        multipleLines: false
      },
      {
        id: 'q18',
        type: 'blank',
        questionText: 'Is this visit for an established problem or a new problem? ¿Esta visita es por un problema establecido o un problema nuevo?',
        isRequired: true,
        multipleLines: false
      },
      {
        id: 'q19',
        type: 'blank',
        questionText: 'Visit Related Details',
        isRequired: true,
        multipleLines: true
      },
      {
        id: 'q20',
        type: 'blank',
        questionText: 'Visit Related Details Detalles Relacionados con la Visita',
        isRequired: true,
        multipleLines: true
      },
      {
        id: 'q21',
        type: 'blank',
        questionText: 'Previous Care',
        isRequired: true,
        multipleLines: true
      },
      {
        id: 'q22',
        type: 'blank',
        questionText: 'Previous Care Cuidados Previos',
        isRequired: true,
        multipleLines: true
      },
      {
        id: 'q23',
        type: 'blank',
        questionText: 'Please provide as much detail as possible about the incident surrounding the injury so that I can write as detailed a note as possible to help your case. Try to Include how it happened, where it happened, care received initially and ongoing, any relevant dates.',
        isRequired: true,
        multipleLines: true
      },
      {
        id: 'q24',
        type: 'blank',
        questionText: 'Please provide as much detail as possible about the incident surrounding the injury so that I can write as detailed a note as possible to help your case. Try to Include how it happened, where it happened, care received initially and ongoing, any relevant dates. Por favor, proporcione tanto detalle como sea posible sobre el incidente que rodea la lesión para que pueda escribir una nota lo más detallada posible para ayudar en su caso. Intente incluir cómo sucedió, dónde sucedió, atención recibida inicialmente y continuada, cualquier fecha relevante.',
        isRequired: true,
        multipleLines: true
      },
      {
        id: 'q25',
        type: 'blank',
        questionText: 'How does it impact your quality of life?',
        isRequired: true,
        multipleLines: true
      },
      {
        id: 'q26',
        type: 'blank',
        questionText: 'How does it impact your quality of life? ¿Cómo afecta esto a su calidad de vida?',
        isRequired: true,
        multipleLines: true
      },
      {
        id: 'q27',
        type: 'blank',
        questionText: 'Have you had any serious conditions, illnesses, injuries, and/or hospitalizations in the past? If \'yes\', please list approximate dates. If you have none write "not applicable".',
        isRequired: true,
        multipleLines: true
      },
      {
        id: 'q28',
        type: 'blank',
        questionText: 'Have you had any serious conditions, illnesses, injuries, and/or hospitalizations in the past? If \'yes\', please list approximate dates. If you have none write "not applicable". ¿Ha tenido alguna condición seria, enfermedad, lesión y/o hospitalización en el pasado? Si es \'sí\', por favor liste las fechas aproximadas. Si no tiene ninguno, escriba "no aplica".',
        isRequired: true,
        multipleLines: true
      },
      {
        id: 'q29',
        type: 'allergies',
        questionText: 'Do you have any allergies (medicines, cosmetics, environmental, foods)? If \'yes\', please describe. If you have none write "no".',
        isRequired: true,
        matrix: {
          rowHeader: 'Allergies',
          columnHeaders: ['Allergic To', 'Allergy Type', 'Reaction', 'Severity', 'Date of Onset', 'End Date'],
          columnTypes: ['text', 'dropdown', 'dropdown', 'dropdown', 'text', 'text'],
          rows: ['1', '2', '3'],
          dropdownOptions: [
            [], // No options for 'Allergic To' (text field)
            ['Food', 'Medication', 'Environmental', 'Other'], // Options for 'Allergy Type'
            ['Rash', 'Hives', 'Swelling', 'Anaphylaxis', 'GI Issues', 'Respiratory', 'Other'], // Options for 'Reaction'
            ['Mild', 'Moderate', 'Severe', 'Life-threatening'], // Options for 'Severity'
            [], // No options for 'Date of Onset' (text field)
            []  // No options for 'End Date' (text field)
          ],
          displayTextBox: true
        }
      },
      {
        id: 'q30',
        type: 'blank',
        questionText: 'Do you have any allergies (medicines, cosmetics, environmental, foods)? If \'yes\', please describe. ¿Tiene alguna alergia (medicamentos, cosméticos, ambientales, alimentos)? Si es \'sí\', por favor describa. Si no tiene ninguno, escriba "no".',
        isRequired: true,
        multipleLines: true
      },
      // Add remaining questions as needed
    ];
    
    setFormTemplate(prev => ({
      ...prev,
      items: defaultItems
    }));
    
    // Select the first item
    setCurrentItemIndex(0);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // For checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormTemplate(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormTemplate(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const addNewQuestion = (questionType: string) => {
    let newItem: FormItem;
    const newId = `q${formTemplate.items.length + 1}`;
    
    switch (questionType) {
      case 'blank':
        newItem = {
          id: newId,
          type: 'blank',
          questionText: 'Type your question text here',
          isRequired: false,
          placeholder: 'Enter your answer here',
          multipleLines: false
        };
        break;
      case 'demographics':
        newItem = {
          id: newId,
          type: 'demographics',
          questionText: 'Demographics Information',
          isRequired: false,
          instructions: 'Please enter your information.',
          demographicFields: [
            { fieldName: 'First Name', fieldType: 'text', required: true },
            { fieldName: 'Last Name', fieldType: 'text', required: true },
            { fieldName: 'Date of Birth', fieldType: 'date', required: true },
            { fieldName: 'Gender', fieldType: 'dropdown', required: true, options: ['Male', 'Female', 'Non-Binary', 'Prefer not to say'] },
            { fieldName: 'Email', fieldType: 'text', required: true },
            { fieldName: 'Phone', fieldType: 'text', required: true }
          ]
        };
        break;
      case 'primaryInsurance':
        newItem = {
          id: newId,
          type: 'primaryInsurance',
          questionText: 'Primary Insurance Information',
          isRequired: false,
          instructions: 'Please provide your primary insurance details.',
          insuranceFields: [
            { fieldName: 'Insurance Company', fieldType: 'text', required: true },
            { fieldName: 'Policy Number', fieldType: 'text', required: true },
            { fieldName: 'Group Number', fieldType: 'text', required: false },
            { fieldName: 'Policyholder Name', fieldType: 'text', required: true },
            { fieldName: 'Relationship to Policyholder', fieldType: 'dropdown', required: true, options: ['Self', 'Spouse', 'Child', 'Other'] }
          ]
        };
        break;
      case 'secondaryInsurance':
        newItem = {
          id: newId,
          type: 'secondaryInsurance',
          questionText: 'Secondary Insurance Information',
          isRequired: false,
          instructions: 'Please provide your secondary insurance details if applicable.',
          insuranceFields: [
            { fieldName: 'Insurance Company', fieldType: 'text', required: false },
            { fieldName: 'Policy Number', fieldType: 'text', required: false },
            { fieldName: 'Group Number', fieldType: 'text', required: false },
            { fieldName: 'Policyholder Name', fieldType: 'text', required: false },
            { fieldName: 'Relationship to Policyholder', fieldType: 'dropdown', required: false, options: ['Self', 'Spouse', 'Child', 'Other'] }
          ]
        };
        break;
      case 'allergies':
        newItem = {
          id: newId,
          type: 'allergies',
          questionText: 'Please enter the details of any allergies',
          isRequired: false,
          matrix: {
            rowHeader: 'Allergies',
            columnHeaders: ['Allergic To', 'Allergy Type', 'Reaction', 'Severity', 'Date of Onset', 'End Date'],
            columnTypes: ['text', 'dropdown', 'dropdown', 'dropdown', 'text', 'text'],
            rows: ['1', '2', '3'],
            dropdownOptions: [
              [], // No options for 'Allergic To' (text field)
              ['Food', 'Medication', 'Environmental', 'Other'], // Options for 'Allergy Type'
              ['Rash', 'Hives', 'Swelling', 'Anaphylaxis', 'GI Issues', 'Respiratory', 'Other'], // Options for 'Reaction'
              ['Mild', 'Moderate', 'Severe', 'Life-threatening'], // Options for 'Severity'
              [], // No options for 'Date of Onset' (text field)
              []  // No options for 'End Date' (text field)
            ],
            displayTextBox: true
          }
        };
        break;
      default:
        newItem = {
          id: newId,
          type: 'blank',
          questionText: 'Type your question text here',
          isRequired: false,
          placeholder: 'Enter your answer here',
          multipleLines: false
        };
    }
    
    const updatedItems = [...formTemplate.items, newItem];
    setFormTemplate(prev => ({
      ...prev,
      items: updatedItems
    }));
    
    // Select the newly added item
    setCurrentItemIndex(updatedItems.length - 1);
  };
  
  const updateQuestion = (index: number, updatedItem: FormItem) => {
    const updatedItems = [...formTemplate.items];
    updatedItems[index] = updatedItem;
    
    setFormTemplate(prev => ({
      ...prev,
      items: updatedItems
    }));
  };
  
  const duplicateQuestion = (index: number) => {
    const itemToDuplicate = { ...formTemplate.items[index] };
    // Generate a new ID for the duplicated item
    itemToDuplicate.id = `q${formTemplate.items.length + 1}`;
    
    const updatedItems = [
      ...formTemplate.items.slice(0, index + 1),
      itemToDuplicate,
      ...formTemplate.items.slice(index + 1)
    ];
    
    setFormTemplate(prev => ({
      ...prev,
      items: updatedItems
    }));
    
    // Select the duplicated item
    setCurrentItemIndex(index + 1);
  };
  
  const deleteQuestion = (index: number) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updatedItems = formTemplate.items.filter((_, i) => i !== index);
      
      setFormTemplate(prev => ({
        ...prev,
        items: updatedItems
      }));
      
      // Update current item index
      if (currentItemIndex === index) {
        if (updatedItems.length > 0) {
          if (index < updatedItems.length) {
            setCurrentItemIndex(index);
          } else {
            setCurrentItemIndex(updatedItems.length - 1);
          }
        } else {
          setCurrentItemIndex(null);
        }
      } else if (currentItemIndex !== null && currentItemIndex > index) {
        setCurrentItemIndex(currentItemIndex - 1);
      }
    }
  };
  
  const moveQuestionUp = (index: number) => {
    if (index === 0) return; // Already at the top
    
    const updatedItems = [...formTemplate.items];
    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[index - 1];
    updatedItems[index - 1] = temp;
    
    setFormTemplate(prev => ({
      ...prev,
      items: updatedItems
    }));
    
    // Update current item index
    if (currentItemIndex === index) {
      setCurrentItemIndex(index - 1);
    } else if (currentItemIndex === index - 1) {
      setCurrentItemIndex(index);
    }
  };
  
  const moveQuestionDown = (index: number) => {
    if (index === formTemplate.items.length - 1) return; // Already at the bottom
    
    const updatedItems = [...formTemplate.items];
    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[index + 1];
    updatedItems[index + 1] = temp;
    
    setFormTemplate(prev => ({
      ...prev,
      items: updatedItems
    }));
    
    // Update current item index
    if (currentItemIndex === index) {
      setCurrentItemIndex(index + 1);
    } else if (currentItemIndex === index + 1) {
      setCurrentItemIndex(index);
    }
  };
  
  const saveFormTemplate = async () => {
    // Validate form
    if (!formTemplate.title.trim()) {
      toast.error('Form title is required');
      return;
    }
    
    if (formTemplate.items.length === 0) {
      toast.error('Form must have at least one question');
      return;
    }
    
    setIsSaving(true);
    
    try {
      let response;
      
      if (isEditMode) {
        response = await axios.put(`/api/form-templates/${id}`, formTemplate);
        toast.success('Form template updated successfully');
      } else {
        response = await axios.post('/api/form-templates', formTemplate);
        toast.success('Form template created successfully');
      }
      
      // Navigate to form templates list
      navigate('/forms/templates');
    } catch (error) {
      console.error('Error saving form template:', error);
      toast.error('Failed to save form template');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSendToClient = async () => {
    if (!clientEmail || !clientName) {
      toast.error('Client email and name are required');
      return;
    }
    
    try {
      const response = await axios.post('/api/patients/send-to-client', {
        email: clientEmail,
        name: clientName,
        instructions: instructions,
        language: formTemplate.language || 'english',
        formTemplateId: formTemplate._id
      });
      
      toast.success('Form sent successfully to client');
      setShowSendModal(false);
      setClientEmail('');
      setClientName('');
      setInstructions('');
    } catch (error) {
      console.error('Error sending form:', error);
      toast.error('Failed to send form to client');
    }
  };
  
  const handlePreview = () => {
    setShowPreview(true);
    setPreviewStep(0);
  };
  
  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (currentItemIndex === null) return;
    
    const updatedItem = { ...formTemplate.items[currentItemIndex] };
    updatedItem.questionText = e.target.value;
    
    updateQuestion(currentItemIndex, updatedItem);
  };
  
  const handleRequiredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentItemIndex === null) return;
    
    const updatedItem = { ...formTemplate.items[currentItemIndex] };
    updatedItem.isRequired = e.target.checked;
    
    updateQuestion(currentItemIndex, updatedItem);
  };
  
  const handleMultipleLinesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentItemIndex === null || formTemplate.items[currentItemIndex].type !== 'blank') return;
    
    const updatedItem = { ...formTemplate.items[currentItemIndex] };
    updatedItem.multipleLines = e.target.checked;
    
    updateQuestion(currentItemIndex, updatedItem);
  };
  
  const handlePlaceholderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentItemIndex === null || formTemplate.items[currentItemIndex].type !== 'blank') return;
    
    const updatedItem = { ...formTemplate.items[currentItemIndex] };
    updatedItem.placeholder = e.target.value;
    
    updateQuestion(currentItemIndex, updatedItem);
  };
  
  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (currentItemIndex === null) return;
    
    const updatedItem = { ...formTemplate.items[currentItemIndex] };
    updatedItem.instructions = e.target.value;
    
    updateQuestion(currentItemIndex, updatedItem);
  };
  
  const renderQuestionEditor = () => {
    if (currentItemIndex === null || !formTemplate.items[currentItemIndex]) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No question selected</p>
            <button
              onClick={() => addNewQuestion('blank')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Plus className="inline-block mr-2 h-4 w-4" />
              Add Question
            </button>
          </div>
        </div>
      );
    }
    
    const currentItem = formTemplate.items[currentItemIndex];
    
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Question Type</h2>
            <div className="flex items-center">
              <button
                type="button"
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Question Options
              </button>
            </div>
          </div>
          
          <div className="relative">
            <select
              value={currentItem.type}
              disabled
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="blank">Open Answer</option>
              <option value="demographics">Demographics</option>
              <option value="primaryInsurance">Primary Insurance</option>
              <option value="secondaryInsurance">Secondary Insurance</option>
              <option value="allergies">Allergies Matrix</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="questionText" className="block text-sm font-medium text-gray-700">
              Question
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRequired"
                checked={currentItem.isRequired}
                onChange={handleRequiredChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-900">
                Is Required
              </label>
            </div>
          </div>
          <textarea
            id="questionText"
            value={currentItem.questionText}
            onChange={handleQuestionTextChange}
            rows={3}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Type your question text here"
          />
        </div>
        
        {currentItem.type === 'blank' && (
          <>
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="multipleLines"
                  checked={currentItem.multipleLines}
                  onChange={handleMultipleLinesChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="multipleLines" className="ml-2 block text-sm text-gray-900">
                  Provide multiple lines for answer
                </label>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="placeholder" className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                id="placeholder"
                value={currentItem.placeholder || ''}
                onChange={handlePlaceholderChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter placeholder text"
              />
            </div>
          </>
        )}
        
        {(currentItem.type === 'demographics' || currentItem.type === 'primaryInsurance' || currentItem.type === 'secondaryInsurance') && (
          <div className="mb-6">
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
              Block Instructions (optional)
            </label>
            <textarea
              id="instructions"
              value={currentItem.instructions || ''}
              onChange={handleInstructionsChange}
              rows={3}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter instructions for this section"
            />
          </div>
        )}
        
        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={() => duplicateQuestion(currentItemIndex)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => deleteQuestion(currentItemIndex)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    );
  };
  
  const renderPreview = () => {
    if (!showPreview || formTemplate.items.length === 0) return null;
    
    const currentQuestion = formTemplate.items[previewStep];
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Form Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="bg-gray-100 p-6 rounded-lg">
              <div className="mb-2 text-sm text-gray-500">
                Question {previewStep + 1} of {formTemplate.items.length}
              </div>
              
              <div className="h-2 w-full bg-gray-300 rounded-full mb-6">
                <div 
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${((previewStep + 1) / formTemplate.items.length) * 100}%` }}
                ></div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">{currentQuestion.questionText}</h3>
                
                {currentQuestion.type === 'blank' && (
                  <div>
                    {currentQuestion.multipleLines ? (
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={4}
                        placeholder={currentQuestion.placeholder || 'Enter your answer here'}
                        disabled
                      ></textarea>
                    ) : (
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder={currentQuestion.placeholder || 'Enter your answer here'}
                        disabled
                      />
                    )}
                  </div>
                )}
                
                {currentQuestion.type === 'demographics' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.demographicFields?.map((field, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.fieldName}{field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.fieldType === 'text' && (
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder={`Enter ${field.fieldName.toLowerCase()}`}
                            disabled
                          />
                        )}
                        {field.fieldType === 'date' && (
                          <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            disabled
                          />
                        )}
                        {field.fieldType === 'dropdown' && (
                          <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            disabled
                          >
                            <option value="">Select {field.fieldName}</option>
                            {field.options?.map((option, i) => (
                              <option key={i} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {(currentQuestion.type === 'primaryInsurance' || currentQuestion.type === 'secondaryInsurance') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.insuranceFields?.map((field, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.fieldName}{field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.fieldType === 'text' && (
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder={`Enter ${field.fieldName.toLowerCase()}`}
                            disabled
                          />
                        )}
                        {field.fieldType === 'date' && (
                          <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            disabled
                          />
                        )}
                        {field.fieldType === 'dropdown' && (
                          <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            disabled
                          >
                            <option value="">Select {field.fieldName}</option>
                            {field.options?.map((option, i) => (
                              <option key={i} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {currentQuestion.type === 'allergies' && (
                  <div>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          {currentQuestion.matrix?.columnHeaders.map((header, index) => (
                            <th key={index} className="px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentQuestion.matrix?.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {currentQuestion.matrix?.columnHeaders.map((_, colIndex) => (
                              <td key={colIndex} className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {currentQuestion.matrix?.columnTypes[colIndex] === 'dropdown' ? (
                                  <select
                                    className="w-full p-1 border border-gray-300 rounded-md text-sm"
                                    disabled
                                  >
                                    <option value="">Select</option>
                                    {currentQuestion.matrix?.dropdownOptions[colIndex]?.map((option, i) => (
                                      <option key={i} value={option}>{option}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    className="w-full p-1 border border-gray-300 rounded-md text-sm"
                                    disabled
                                  />
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {currentQuestion.matrix?.displayTextBox && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Information
                        </label>
                        <textarea
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows={3}
                          placeholder="Enter any additional information about your allergies"
                          disabled
                        ></textarea>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setPreviewStep(prev => Math.max(0, prev - 1))}
                  disabled={previewStep === 0}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPreviewStep(prev => Math.min(formTemplate.items.length - 1, prev + 1))}
                  disabled={previewStep === formTemplate.items.length - 1}
                  className="px-4 py-2 bg-green-500 text-white rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderSendModal = () => {
    if (!showSendModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Send Form to Client</h2>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name*
                </label>
                <input
                  type="text"
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter client name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Client Email*
                </label>
                <input
                  type="email"
                  id="clientEmail"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter client email"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions (Optional)
                </label>
                <textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter any special instructions for the client"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => setShowSendModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSendToClient}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
      {/* Header with buttons */}
      <div className="bg-blue-800 text-white p-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/forms/templates')}
          className="flex items-center text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSendModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Send to Client
          </button>
          
          <button
            onClick={handlePreview}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </button>
          
          <button
            onClick={saveFormTemplate}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          
          <button className="px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="flex">
        {/* Left sidebar - Question list */}
        <div className="w-1/4 bg-white border-r border-gray-200 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">{formTemplate.title}</h2>
            <p className="text-sm text-gray-500">{formTemplate.description}</p>
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Add Question</h3>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => addNewQuestion('blank')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Add Blank Question
              </button>
              <button
                onClick={() => addNewQuestion('demographics')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Add Demographics Question
              </button>
              <button
                onClick={() => addNewQuestion('primaryInsurance')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Add Primary Insurance Question
              </button>
              <button
                onClick={() => addNewQuestion('secondaryInsurance')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Add Secondary Insurance Question
              </button>
              <button
                onClick={() => addNewQuestion('allergies')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Add Allergies Question
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Questions</h3>
            <div className="space-y-1">
              {formTemplate.items.map((item, index) => (
                <div 
                  key={item.id}
                  className={`relative border-l-4 ${currentItemIndex === index ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'} transition-colors`}
                >
                  <button
                    onClick={() => setCurrentItemIndex(index)}
                    className="w-full text-left px-3 py-2 text-sm"
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-gray-500">{index + 1}.</span>
                      <span className="truncate flex-1">
                        {item.questionText.length > 50 
                          ? `${item.questionText.substring(0, 50)}...` 
                          : item.questionText}
                      </span>
                    </div>
                  </button>
                  
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveQuestionUp(index);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveQuestionDown(index);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      disabled={index === formTemplate.items.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main content - Question editor */}
        <div className="w-3/4 p-6 bg-gray-100 h-[calc(100vh-64px)] overflow-y-auto">
          {renderQuestionEditor()}
        </div>
      </div>
      
      {/* Preview Modal */}
      {renderPreview()}
      
      {/* Send to Client Modal */}
      {renderSendModal()}
    </div>
  );
};

export default PatientIntakeFormBuilder;