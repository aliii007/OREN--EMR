import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import WizardProgressBar from '../../components/patients/WizardProgressBar';
import WizardFormStep from '../../components/patients/WizardFormStep';
import SendFormModal, { SendFormData } from '../../components/forms/SendFormModal';

// Define form section interface
interface FormSection {
  id: string;
  title: string;
  spanishTitle?: string;
  fields: FormField[];
}

// Define form field interface with various field types
interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'array' | 'address' | 'bodyPart';
  label: string;
  spanishLabel?: string;
  placeholder?: string;
  spanishPlaceholder?: string;
  required?: boolean;
  options?: { value: string; label: string; spanishLabel?: string }[];
  arrayType?: 'text';
  path: string; // Path to store in patient object (e.g., 'firstName', 'address.street', 'medicalHistory.allergies')
}

const PatientWizardForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState<'english' | 'spanish'>('english');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSendFormModal, setShowSendFormModal] = useState(false);
  
  // Initialize patient data with empty values
  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    medicalHistory: {
      allergies: [''],
      medications: [''],
      conditions: [''],
      surgeries: [''],
      familyHistory: ['']
    },
    subjective: {
      bodyPart: [{ part: '', side: '' }],
      severity: '',
      quality: [],
      timing: '',
      context: '',
      exacerbatedBy: [],
      symptoms: [],
      notes: '',
      radiatingTo: '',
      radiatingRight: false,
      radiatingLeft: false,
      sciaticaRight: false,
      sciaticaLeft: false
    },
    attorney: {
      name: '',
      firm: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      }
    },
    assignedDoctor: user?.role === 'doctor' ? user.id : '',
    injuryDate: '',
    status: 'active'
  });
  
  // Define form sections dynamically
  const formSections: FormSection[] = [
    {
      id: 'language',
      title: 'Language Preference',
      spanishTitle: 'Preferencia de Idioma',
      fields: [
        {
          id: 'language',
          type: 'radio',
          label: 'Preferred Language',
          spanishLabel: 'Idioma Preferido',
          required: true,
          options: [
            { value: 'english', label: 'English' },
            { value: 'spanish', label: 'Español' }
          ],
          path: 'language'
        }
      ]
    },
    {
      id: 'personalInfo',
      title: 'Personal Information',
      spanishTitle: 'Información Personal',
      fields: [
        {
          id: 'firstName',
          type: 'text',
          label: 'First Name',
          spanishLabel: 'Nombre',
          placeholder: 'Enter first name',
          spanishPlaceholder: 'Ingrese nombre',
          required: true,
          path: 'firstName'
        },
        {
          id: 'lastName',
          type: 'text',
          label: 'Last Name',
          spanishLabel: 'Apellido',
          placeholder: 'Enter last name',
          spanishPlaceholder: 'Ingrese apellido',
          required: true,
          path: 'lastName'
        },
        {
          id: 'dateOfBirth',
          type: 'date',
          label: 'Date of Birth',
          spanishLabel: 'Fecha de Nacimiento',
          required: true,
          path: 'dateOfBirth'
        },
        {
          id: 'gender',
          type: 'select',
          label: 'Gender',
          spanishLabel: 'Género',
          required: true,
          options: [
            { value: '', label: 'Select gender', spanishLabel: 'Seleccione género' },
            { value: 'male', label: 'Male', spanishLabel: 'Masculino' },
            { value: 'female', label: 'Female', spanishLabel: 'Femenino' },
            { value: 'non-binary', label: 'Non-binary', spanishLabel: 'No binario' },
            { value: 'other', label: 'Other', spanishLabel: 'Otro' }
          ],
          path: 'gender'
        },
        {
          id: 'maritalStatus',
          type: 'select',
          label: 'Marital Status',
          spanishLabel: 'Estado Civil',
          options: [
            { value: '', label: 'Select status', spanishLabel: 'Seleccione estado' },
            { value: 'single', label: 'Single', spanishLabel: 'Soltero/a' },
            { value: 'married', label: 'Married', spanishLabel: 'Casado/a' },
            { value: 'domestic-partner', label: 'Domestic Partner', spanishLabel: 'Pareja de Hecho' },
            { value: 'separated', label: 'Separated', spanishLabel: 'Separado/a' },
            { value: 'divorced', label: 'Divorced', spanishLabel: 'Divorciado/a' },
            { value: 'widowed', label: 'Widowed', spanishLabel: 'Viudo/a' }
          ],
          path: 'maritalStatus'
        }
      ]
    },
    {
      id: 'contactInfo',
      title: 'Contact Information',
      spanishTitle: 'Información de Contacto',
      fields: [
        {
          id: 'email',
          type: 'email',
          label: 'Email',
          spanishLabel: 'Correo Electrónico',
          placeholder: 'Enter email address',
          spanishPlaceholder: 'Ingrese correo electrónico',
          required: true,
          path: 'email'
        },
        {
          id: 'phone',
          type: 'tel',
          label: 'Phone Number',
          spanishLabel: 'Número de Teléfono',
          placeholder: 'Enter phone number',
          spanishPlaceholder: 'Ingrese número de teléfono',
          required: true,
          path: 'phone'
        },
        {
          id: 'address',
          type: 'address',
          label: 'Address',
          spanishLabel: 'Dirección',
          required: true,
          path: 'address'
        }
      ]
    },
    {
      id: 'medicalHistory',
      title: 'Medical History',
      spanishTitle: 'Historia Médica',
      fields: [
        {
          id: 'allergies',
          type: 'array',
          arrayType: 'text',
          label: 'Allergies',
          spanishLabel: 'Alergias',
          placeholder: 'Enter allergy',
          spanishPlaceholder: 'Ingrese alergia',
          path: 'medicalHistory.allergies'
        },
        {
          id: 'medications',
          type: 'array',
          arrayType: 'text',
          label: 'Current Medications',
          spanishLabel: 'Medicamentos Actuales',
          placeholder: 'Enter medication',
          spanishPlaceholder: 'Ingrese medicamento',
          path: 'medicalHistory.medications'
        },
        {
          id: 'conditions',
          type: 'array',
          arrayType: 'text',
          label: 'Medical Conditions',
          spanishLabel: 'Condiciones Médicas',
          placeholder: 'Enter condition',
          spanishPlaceholder: 'Ingrese condición',
          path: 'medicalHistory.conditions'
        },
        {
          id: 'surgeries',
          type: 'array',
          arrayType: 'text',
          label: 'Past Surgeries',
          spanishLabel: 'Cirugías Previas',
          placeholder: 'Enter surgery',
          spanishPlaceholder: 'Ingrese cirugía',
          path: 'medicalHistory.surgeries'
        },
        {
          id: 'familyHistory',
          type: 'array',
          arrayType: 'text',
          label: 'Family Medical History',
          spanishLabel: 'Historia Médica Familiar',
          placeholder: 'Enter family history',
          spanishPlaceholder: 'Ingrese historia familiar',
          path: 'medicalHistory.familyHistory'
        }
      ]
    },
    {
      id: 'injuryInfo',
      title: 'Injury Information',
      spanishTitle: 'Información de la Lesión',
      fields: [
        {
          id: 'injuryDate',
          type: 'date',
          label: 'Date of Injury',
          spanishLabel: 'Fecha de la Lesión',
          path: 'injuryDate'
        },
        {
          id: 'bodyParts',
          type: 'bodyPart',
          label: 'Affected Body Parts',
          spanishLabel: 'Partes del Cuerpo Afectadas',
          path: 'subjective.bodyPart'
        },
        {
          id: 'severity',
          type: 'select',
          label: 'Pain Severity (1-10)',
          spanishLabel: 'Severidad del Dolor (1-10)',
          options: [
            { value: '', label: 'Select severity', spanishLabel: 'Seleccione severidad' },
            { value: '1', label: '1 - Minimal', spanishLabel: '1 - Mínimo' },
            { value: '2', label: '2', spanishLabel: '2' },
            { value: '3', label: '3', spanishLabel: '3' },
            { value: '4', label: '4', spanishLabel: '4' },
            { value: '5', label: '5 - Moderate', spanishLabel: '5 - Moderado' },
            { value: '6', label: '6', spanishLabel: '6' },
            { value: '7', label: '7', spanishLabel: '7' },
            { value: '8', label: '8', spanishLabel: '8' },
            { value: '9', label: '9', spanishLabel: '9' },
            { value: '10', label: '10 - Severe', spanishLabel: '10 - Severo' }
          ],
          path: 'subjective.severity'
        },
        {
          id: 'quality',
          type: 'checkbox',
          label: 'Pain Quality',
          spanishLabel: 'Calidad del Dolor',
          options: [
            { value: 'sharp', label: 'Sharp', spanishLabel: 'Agudo' },
            { value: 'dull', label: 'Dull', spanishLabel: 'Sordo' },
            { value: 'aching', label: 'Aching', spanishLabel: 'Dolorido' },
            { value: 'burning', label: 'Burning', spanishLabel: 'Ardiente' },
            { value: 'throbbing', label: 'Throbbing', spanishLabel: 'Pulsante' },
            { value: 'stabbing', label: 'Stabbing', spanishLabel: 'Punzante' },
            { value: 'tingling', label: 'Tingling', spanishLabel: 'Hormigueo' },
            { value: 'numbness', label: 'Numbness', spanishLabel: 'Entumecimiento' }
          ],
          path: 'subjective.quality'
        },
        {
          id: 'timing',
          type: 'select',
          label: 'Pain Timing',
          spanishLabel: 'Frecuencia del Dolor',
          options: [
            { value: '', label: 'Select timing', spanishLabel: 'Seleccione frecuencia' },
            { value: 'constant', label: 'Constant', spanishLabel: 'Constante' },
            { value: 'intermittent', label: 'Intermittent', spanishLabel: 'Intermitente' },
            { value: 'worse-morning', label: 'Worse in the morning', spanishLabel: 'Peor en la mañana' },
            { value: 'worse-evening', label: 'Worse in the evening', spanishLabel: 'Peor en la noche' },
            { value: 'worse-activity', label: 'Worse with activity', spanishLabel: 'Peor con actividad' },
            { value: 'worse-rest', label: 'Worse with rest', spanishLabel: 'Peor en reposo' }
          ],
          path: 'subjective.timing'
        },
        {
          id: 'context',
          type: 'textarea',
          label: 'Context (How did the injury occur?)',
          spanishLabel: 'Contexto (¿Cómo ocurrió la lesión?)',
          placeholder: 'Describe how the injury occurred',
          spanishPlaceholder: 'Describa cómo ocurrió la lesión',
          path: 'subjective.context'
        },
        {
          id: 'exacerbatedBy',
          type: 'checkbox',
          label: 'Pain is Exacerbated By',
          spanishLabel: 'El Dolor se Agrava Con',
          options: [
            { value: 'sitting', label: 'Sitting', spanishLabel: 'Sentarse' },
            { value: 'standing', label: 'Standing', spanishLabel: 'Estar de pie' },
            { value: 'walking', label: 'Walking', spanishLabel: 'Caminar' },
            { value: 'bending', label: 'Bending', spanishLabel: 'Agacharse' },
            { value: 'lifting', label: 'Lifting', spanishLabel: 'Levantar peso' },
            { value: 'twisting', label: 'Twisting', spanishLabel: 'Girar' },
            { value: 'reaching', label: 'Reaching', spanishLabel: 'Alcanzar' },
            { value: 'pushing', label: 'Pushing', spanishLabel: 'Empujar' },
            { value: 'pulling', label: 'Pulling', spanishLabel: 'Jalar' }
          ],
          path: 'subjective.exacerbatedBy'
        },
        {
          id: 'symptoms',
          type: 'checkbox',
          label: 'Associated Symptoms',
          spanishLabel: 'Síntomas Asociados',
          options: [
            { value: 'headache', label: 'Headache', spanishLabel: 'Dolor de cabeza' },
            { value: 'dizziness', label: 'Dizziness', spanishLabel: 'Mareo' },
            { value: 'nausea', label: 'Nausea', spanishLabel: 'Náusea' },
            { value: 'weakness', label: 'Weakness', spanishLabel: 'Debilidad' },
            { value: 'fatigue', label: 'Fatigue', spanishLabel: 'Fatiga' },
            { value: 'sleep-disturbance', label: 'Sleep Disturbance', spanishLabel: 'Alteración del sueño' },
            { value: 'anxiety', label: 'Anxiety', spanishLabel: 'Ansiedad' },
            { value: 'depression', label: 'Depression', spanishLabel: 'Depresión' }
          ],
          path: 'subjective.symptoms'
        },
        {
          id: 'radiatingPain',
          type: 'checkbox',
          label: 'Radiating Pain',
          spanishLabel: 'Dolor Irradiado',
          options: [
            { value: 'radiatingRight', label: 'Right Side', spanishLabel: 'Lado Derecho' },
            { value: 'radiatingLeft', label: 'Left Side', spanishLabel: 'Lado Izquierdo' }
          ],
          path: 'subjective.radiating'
        },
        {
          id: 'sciatica',
          type: 'checkbox',
          label: 'Sciatica',
          spanishLabel: 'Ciática',
          options: [
            { value: 'sciaticaRight', label: 'Right Side', spanishLabel: 'Lado Derecho' },
            { value: 'sciaticaLeft', label: 'Left Side', spanishLabel: 'Lado Izquierdo' }
          ],
          path: 'subjective.sciatica'
        },
        {
          id: 'notes',
          type: 'textarea',
          label: 'Additional Notes',
          spanishLabel: 'Notas Adicionales',
          placeholder: 'Any additional information about your condition',
          spanishPlaceholder: 'Cualquier información adicional sobre su condición',
          path: 'subjective.notes'
        }
      ]
    },
    {
      id: 'attorney',
      title: 'Attorney Information',
      spanishTitle: 'Información del Abogado',
      fields: [
        {
          id: 'hasAttorney',
          type: 'radio',
          label: 'Do you have an attorney for this case?',
          spanishLabel: '¿Tiene un abogado para este caso?',
          options: [
            { value: 'yes', label: 'Yes', spanishLabel: 'Sí' },
            { value: 'no', label: 'No', spanishLabel: 'No' }
          ],
          path: 'hasAttorney'
        },
        {
          id: 'attorneyName',
          type: 'text',
          label: 'Attorney Name',
          spanishLabel: 'Nombre del Abogado',
          placeholder: 'Enter attorney name',
          spanishPlaceholder: 'Ingrese nombre del abogado',
          path: 'attorney.name'
        },
        {
          id: 'attorneyFirm',
          type: 'text',
          label: 'Law Firm',
          spanishLabel: 'Bufete de Abogados',
          placeholder: 'Enter law firm name',
          spanishPlaceholder: 'Ingrese nombre del bufete',
          path: 'attorney.firm'
        },
        {
          id: 'attorneyPhone',
          type: 'tel',
          label: 'Attorney Phone',
          spanishLabel: 'Teléfono del Abogado',
          placeholder: 'Enter attorney phone',
          spanishPlaceholder: 'Ingrese teléfono del abogado',
          path: 'attorney.phone'
        },
        {
          id: 'attorneyEmail',
          type: 'email',
          label: 'Attorney Email',
          spanishLabel: 'Correo del Abogado',
          placeholder: 'Enter attorney email',
          spanishPlaceholder: 'Ingrese correo del abogado',
          path: 'attorney.email'
        },
        {
          id: 'attorneyAddress',
          type: 'address',
          label: 'Attorney Address',
          spanishLabel: 'Dirección del Abogado',
          path: 'attorney.address'
        }
      ]
    },
    {
      id: 'review',
      title: 'Review & Submit',
      spanishTitle: 'Revisar y Enviar',
      fields: []
    }
  ];
  
  // Get step titles for progress bar
  const stepTitles = formSections.map(section => language === 'english' ? section.title : section.spanishTitle || section.title);
  
  // Fetch patient data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchPatientData();
    }
  }, [isEditMode, id]);
  
  // Fetch patient data from API
  const fetchPatientData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/patients/${id}`);
      setPatientData(response.data);
      
      // Set language based on patient data if available
      if (response.data.preferredLanguage) {
        setLanguage(response.data.preferredLanguage);
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load patient data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form field changes
  const handleChange = (path: string, value: any) => {
    // Split the path into parts (e.g., 'address.street' -> ['address', 'street'])
    const pathParts = path.split('.');
    
    setPatientData(prevData => {
      // Create a copy of the previous data
      const newData = { ...prevData };
      
      // Navigate to the correct nested object
      let current = newData;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      // Set the value at the final path
      current[pathParts[pathParts.length - 1]] = value;
      
      return newData;
    });
    
    // Save data in real-time if needed
    if (isEditMode && id) {
      savePatientDataDebounced(id, patientData);
    }
  };
  
  // Handle array field changes
  const handleArrayChange = (path: string, index: number, value: any) => {
    // Split the path into parts (e.g., 'medicalHistory.allergies' -> ['medicalHistory', 'allergies'])
    const pathParts = path.split('.');
    
    setPatientData(prevData => {
      // Create a copy of the previous data
      const newData = { ...prevData };
      
      // Navigate to the correct nested object
      let current = newData;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      // Update the array at the specified index
      const arrayName = pathParts[pathParts.length - 1];
      const newArray = [...current[arrayName]];
      newArray[index] = value;
      current[arrayName] = newArray;
      
      return newData;
    });
    
    // Save data in real-time if needed
    if (isEditMode && id) {
      savePatientDataDebounced(id, patientData);
    }
  };
  
  // Add item to array
  const addArrayItem = (path: string, defaultValue: any = '') => {
    // Split the path into parts
    const pathParts = path.split('.');
    
    setPatientData(prevData => {
      // Create a copy of the previous data
      const newData = { ...prevData };
      
      // Navigate to the correct nested object
      let current = newData;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      // Add item to the array
      const arrayName = pathParts[pathParts.length - 1];
      current[arrayName] = [...current[arrayName], defaultValue];
      
      return newData;
    });
  };
  
  // Remove item from array
  const removeArrayItem = (path: string, index: number) => {
    // Split the path into parts
    const pathParts = path.split('.');
    
    setPatientData(prevData => {
      // Create a copy of the previous data
      const newData = { ...prevData };
      
      // Navigate to the correct nested object
      let current = newData;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      // Remove item from the array
      const arrayName = pathParts[pathParts.length - 1];
      const newArray = [...current[arrayName]];
      newArray.splice(index, 1);
      current[arrayName] = newArray;
      
      return newData;
    });
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (path: string, value: string, checked: boolean) => {
    // Split the path into parts
    const pathParts = path.split('.');
    
    setPatientData(prevData => {
      // Create a copy of the previous data
      const newData = { ...prevData };
      
      // Navigate to the correct nested object
      let current = newData;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      // Update the array based on checked status
      const arrayName = pathParts[pathParts.length - 1];
      let newArray = [...current[arrayName]];
      
      if (checked) {
        // Add value if not already in array
        if (!newArray.includes(value)) {
          newArray.push(value);
        }
      } else {
        // Remove value from array
        newArray = newArray.filter(item => item !== value);
      }
      
      current[arrayName] = newArray;
      
      return newData;
    });
  };
  
  // Handle special checkbox fields (like radiating pain and sciatica)
  const handleSpecialCheckboxChange = (field: string, checked: boolean) => {
    setPatientData(prevData => ({
      ...prevData,
      subjective: {
        ...prevData.subjective,
        [field]: checked
      }
    }));
  };
  
  // Handle body part changes
  const handleBodyPartChange = (index: number, field: 'part' | 'side', value: string) => {
    setPatientData(prevData => {
      const newBodyParts = [...prevData.subjective.bodyPart];
      newBodyParts[index] = {
        ...newBodyParts[index],
        [field]: value
      };
      
      return {
        ...prevData,
        subjective: {
          ...prevData.subjective,
          bodyPart: newBodyParts
        }
      };
    });
  };
  
  // Add body part
  const addBodyPart = () => {
    setPatientData(prevData => ({
      ...prevData,
      subjective: {
        ...prevData.subjective,
        bodyPart: [...prevData.subjective.bodyPart, { part: '', side: '' }]
      }
    }));
  };
  
  // Remove body part
  const removeBodyPart = (index: number) => {
    setPatientData(prevData => {
      const newBodyParts = [...prevData.subjective.bodyPart];
      newBodyParts.splice(index, 1);
      
      return {
        ...prevData,
        subjective: {
          ...prevData.subjective,
          bodyPart: newBodyParts
        }
      };
    });
  };
  
  // Create a debounced version of savePatientData for real-time saving
  const savePatientDataDebounced = (patientId: string, data: any) => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      savePatientData(patientId, data, false);
    }, 1000); // 1 second delay
  };
  
  let saveTimeout: NodeJS.Timeout | null = null;
  
  // Save patient data to API
  const savePatientData = async (patientId: string | null, data: any, showToast: boolean = true) => {
    try {
      setIsSaving(true);
      
      // Prepare data for API
      const patientDataToSave = {
        ...data,
        assignedDoctor: user?.role === 'doctor' ? user.id : data.assignedDoctor
      };
      
      let response;
      
      if (patientId) {
        // Update existing patient
        response = await axios.put(`http://localhost:5000/api/patients/${patientId}`, patientDataToSave);
        if (showToast) toast.success('Patient updated successfully');
      } else {
        // Create new patient
        response = await axios.post('http://localhost:5000/api/patients', patientDataToSave);
        if (showToast) toast.success('Patient created successfully');
      }
      
      return response.data.patient;
    } catch (error) {
      console.error('Error saving patient data:', error);
      if (showToast) toast.error('Failed to save patient data');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const savedPatient = await savePatientData(id, patientData);
      navigate(`/patients/${savedPatient._id}`);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };
  
  // Handle sending form to client
  const handleSendForm = async (formData: SendFormData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/patients/send-to-client', {
        ...formData,
        patientId: id,
        language: language
      });
      
      toast.success('Form sent successfully to client');
      setShowSendFormModal(false);
      
      // Return the form link for display
      return response.data.formLink;
    } catch (error) {
      console.error('Error sending form:', error);
      toast.error('Failed to send form to client');
      throw error;
    }
  };
  
  // Navigation functions
  const nextStep = () => {
    if (currentStep < formSections.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const goToStep = (step: number) => {
    if (step >= 0 && step < formSections.length) {
      setCurrentStep(step);
      window.scrollTo(0, 0);
    }
  };
  
  // Render form field based on type
  const renderField = (field: FormField) => {
    const fieldLabel = language === 'english' ? field.label : field.spanishLabel || field.label;
    const fieldPlaceholder = language === 'english' ? field.placeholder : field.spanishPlaceholder || field.placeholder;
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {fieldLabel}{field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              value={getNestedValue(patientData, field.path)}
              onChange={(e) => handleChange(field.path, e.target.value)}
              placeholder={fieldPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required={field.required}
            />
          </div>
        );
        
      case 'date':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {fieldLabel}{field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="date"
              value={getNestedValue(patientData, field.path)}
              onChange={(e) => handleChange(field.path, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required={field.required}
            />
          </div>
        );
        
      case 'select':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {fieldLabel}{field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={getNestedValue(patientData, field.path)}
              onChange={(e) => handleChange(field.path, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required={field.required}
            >
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {language === 'english' ? option.label : option.spanishLabel || option.label}
                </option>
              ))}
            </select>
          </div>
        );
        
      case 'radio':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {fieldLabel}{field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value}
                    checked={getNestedValue(patientData, field.path) === option.value}
                    onChange={(e) => handleChange(field.path, e.target.value)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    required={field.required}
                  />
                  <span className="ml-2 text-gray-700">
                    {language === 'english' ? option.label : option.spanishLabel || option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
        
      case 'checkbox':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {fieldLabel}{field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map(option => {
                // Handle special checkbox fields for radiating pain and sciatica
                if (field.path === 'subjective.radiating' || field.path === 'subjective.sciatica') {
                  return (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={patientData.subjective[option.value]}
                        onChange={(e) => handleSpecialCheckboxChange(option.value, e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">
                        {language === 'english' ? option.label : option.spanishLabel || option.label}
                      </span>
                    </label>
                  );
                }
                
                // Regular checkbox fields
                const values = getNestedValue(patientData, field.path) || [];
                return (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={values.includes(option.value)}
                      onChange={(e) => handleCheckboxChange(field.path, option.value, e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">
                      {language === 'english' ? option.label : option.spanishLabel || option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
        
      case 'textarea':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {fieldLabel}{field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={getNestedValue(patientData, field.path)}
              onChange={(e) => handleChange(field.path, e.target.value)}
              placeholder={fieldPlaceholder}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required={field.required}
            />
          </div>
        );
        
      case 'array':
        const arrayValues = getNestedValue(patientData, field.path) || [];
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {fieldLabel}{field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {arrayValues.map((value: string, index: number) => (
                <div key={index} className="flex items-center">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleArrayChange(field.path, index, e.target.value)}
                    placeholder={fieldPlaceholder}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(field.path, index)}
                    className="ml-2 p-2 text-red-600 hover:text-red-800"
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem(field.path)}
                className="mt-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                {language === 'english' ? '+ Add Item' : '+ Agregar Elemento'}
              </button>
            </div>
          </div>
        );
        
      case 'address':
        const addressPath = field.path;
        const address = getNestedValue(patientData, addressPath) || {};
        
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {fieldLabel}{field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={address.street || ''}
                onChange={(e) => handleChange(`${addressPath}.street`, e.target.value)}
                placeholder={language === 'english' ? 'Street Address' : 'Dirección'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required={field.required}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={address.city || ''}
                  onChange={(e) => handleChange(`${addressPath}.city`, e.target.value)}
                  placeholder={language === 'english' ? 'City' : 'Ciudad'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required={field.required}
                />
                <input
                  type="text"
                  value={address.state || ''}
                  onChange={(e) => handleChange(`${addressPath}.state`, e.target.value)}
                  placeholder={language === 'english' ? 'State' : 'Estado'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required={field.required}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={address.zipCode || ''}
                  onChange={(e) => handleChange(`${addressPath}.zipCode`, e.target.value)}
                  placeholder={language === 'english' ? 'Zip Code' : 'Código Postal'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required={field.required}
                />
                <input
                  type="text"
                  value={address.country || 'USA'}
                  onChange={(e) => handleChange(`${addressPath}.country`, e.target.value)}
                  placeholder={language === 'english' ? 'Country' : 'País'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );
        
      case 'bodyPart':
        const bodyParts = patientData.subjective.bodyPart || [];
        
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {fieldLabel}{field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {bodyParts.map((part: { part: string; side: string }, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <select
                    value={part.part}
                    onChange={(e) => handleBodyPartChange(index, 'part', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{language === 'english' ? 'Select body part' : 'Seleccione parte del cuerpo'}</option>
                    <option value="neck">{language === 'english' ? 'Neck' : 'Cuello'}</option>
                    <option value="shoulder">{language === 'english' ? 'Shoulder' : 'Hombro'}</option>
                    <option value="arm">{language === 'english' ? 'Arm' : 'Brazo'}</option>
                    <option value="elbow">{language === 'english' ? 'Elbow' : 'Codo'}</option>
                    <option value="wrist">{language === 'english' ? 'Wrist' : 'Muñeca'}</option>
                    <option value="hand">{language === 'english' ? 'Hand' : 'Mano'}</option>
                    <option value="upper-back">{language === 'english' ? 'Upper Back' : 'Espalda Superior'}</option>
                    <option value="mid-back">{language === 'english' ? 'Mid Back' : 'Espalda Media'}</option>
                    <option value="lower-back">{language === 'english' ? 'Lower Back' : 'Espalda Baja'}</option>
                    <option value="hip">{language === 'english' ? 'Hip' : 'Cadera'}</option>
                    <option value="leg">{language === 'english' ? 'Leg' : 'Pierna'}</option>
                    <option value="knee">{language === 'english' ? 'Knee' : 'Rodilla'}</option>
                    <option value="ankle">{language === 'english' ? 'Ankle' : 'Tobillo'}</option>
                    <option value="foot">{language === 'english' ? 'Foot' : 'Pie'}</option>
                  </select>
                  
                  <select
                    value={part.side}
                    onChange={(e) => handleBodyPartChange(index, 'side', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{language === 'english' ? 'Select side' : 'Seleccione lado'}</option>
                    <option value="left">{language === 'english' ? 'Left' : 'Izquierdo'}</option>
                    <option value="right">{language === 'english' ? 'Right' : 'Derecho'}</option>
                    <option value="both">{language === 'english' ? 'Both' : 'Ambos'}</option>
                    <option value="center">{language === 'english' ? 'Center/Midline' : 'Centro'}</option>
                  </select>
                  
                  <button
                    type="button"
                    onClick={() => removeBodyPart(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                    aria-label="Remove body part"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addBodyPart}
                className="mt-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                {language === 'english' ? '+ Add Body Part' : '+ Agregar Parte del Cuerpo'}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Helper function to get nested value from object using path string
  const getNestedValue = (obj: any, path: string) => {
    const pathParts = path.split('.');
    let current = obj;
    
    for (const part of pathParts) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  };
  
  // Render review section with all patient data
  const renderReviewSection = () => {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-blue-800">
            {language === 'english'
              ? 'Please review all information before submitting. You can go back to any section to make changes.'
              : 'Por favor revise toda la información antes de enviar. Puede volver a cualquier sección para hacer cambios.'}
          </p>
        </div>
        
        {/* Personal Information */}
        <div className="border rounded-md p-4">
          <h3 className="font-medium text-lg mb-2">
            {language === 'english' ? 'Personal Information' : 'Información Personal'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">{language === 'english' ? 'Name' : 'Nombre'}</p>
              <p>{patientData.firstName} {patientData.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'english' ? 'Date of Birth' : 'Fecha de Nacimiento'}</p>
              <p>{patientData.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'english' ? 'Gender' : 'Género'}</p>
              <p>{patientData.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'english' ? 'Marital Status' : 'Estado Civil'}</p>
              <p>{patientData.maritalStatus}</p>
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="border rounded-md p-4">
          <h3 className="font-medium text-lg mb-2">
            {language === 'english' ? 'Contact Information' : 'Información de Contacto'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">{language === 'english' ? 'Email' : 'Correo Electrónico'}</p>
              <p>{patientData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'english' ? 'Phone' : 'Teléfono'}</p>
              <p>{patientData.phone}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">{language === 'english' ? 'Address' : 'Dirección'}</p>
              <p>{patientData.address.street}</p>
              <p>{patientData.address.city}, {patientData.address.state} {patientData.address.zipCode}</p>
              <p>{patientData.address.country}</p>
            </div>
          </div>
        </div>
        
        {/* Medical History */}
        <div className="border rounded-md p-4">
          <h3 className="font-medium text-lg mb-2">
            {language === 'english' ? 'Medical History' : 'Historia Médica'}
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">{language === 'english' ? 'Allergies' : 'Alergias'}</p>
              <ul className="list-disc pl-5">
                {patientData.medicalHistory.allergies.map((allergy: string, index: number) => (
                  allergy && <li key={index}>{allergy}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'english' ? 'Medications' : 'Medicamentos'}</p>
              <ul className="list-disc pl-5">
                {patientData.medicalHistory.medications.map((medication: string, index: number) => (
                  medication && <li key={index}>{medication}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'english' ? 'Medical Conditions' : 'Condiciones Médicas'}</p>
              <ul className="list-disc pl-5">
                {patientData.medicalHistory.conditions.map((condition: string, index: number) => (
                  condition && <li key={index}>{condition}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'english' ? 'Past Surgeries' : 'Cirugías Previas'}</p>
              <ul className="list-disc pl-5">
                {patientData.medicalHistory.surgeries.map((surgery: string, index: number) => (
                  surgery && <li key={index}>{surgery}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Injury Information */}
        <div className="border rounded-md p-4">
          <h3 className="font-medium text-lg mb-2">
            {language === 'english' ? 'Injury Information' : 'Información de la Lesión'}
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">{language === 'english' ? 'Date of Injury' : 'Fecha de la Lesión'}</p>
              <p>{patientData.injuryDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'english' ? 'Affected Body Parts' : 'Partes del Cuerpo Afectadas'}</p>
              <ul className="list-disc pl-5">
                {patientData.subjective.bodyPart.map((part: { part: string; side: string }, index: number) => (
                  part.part && <li key={index}>{part.part} ({part.side})</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'english' ? 'Pain Severity' : 'Severidad del Dolor'}</p>
              <p>{patientData.subjective.severity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'english' ? 'Pain Quality' : 'Calidad del Dolor'}</p>
              <p>{patientData.subjective.quality.join(', ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'english' ? 'Context' : 'Contexto'}</p>
              <p>{patientData.subjective.context}</p>
            </div>
          </div>
        </div>
        
        {/* Attorney Information */}
        {patientData.attorney && patientData.attorney.name && (
          <div className="border rounded-md p-4">
            <h3 className="font-medium text-lg mb-2">
              {language === 'english' ? 'Attorney Information' : 'Información del Abogado'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{language === 'english' ? 'Attorney Name' : 'Nombre del Abogado'}</p>
                <p>{patientData.attorney.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'english' ? 'Law Firm' : 'Bufete de Abogados'}</p>
                <p>{patientData.attorney.firm}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'english' ? 'Contact' : 'Contacto'}</p>
                <p>{patientData.attorney.phone}</p>
                <p>{patientData.attorney.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'english' ? 'Address' : 'Dirección'}</p>
                <p>{patientData.attorney.address.street}</p>
                <p>{patientData.attorney.address.city}, {patientData.attorney.address.state} {patientData.attorney.address.zipCode}</p>
              </div>
            </div>
          </div>
        )}
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditMode
            ? language === 'english'
              ? 'Edit Patient'
              : 'Editar Paciente'
            : language === 'english'
            ? 'New Patient'
            : 'Nuevo Paciente'}
        </h1>
        
        {isEditMode && (
          <button
            type="button"
            onClick={() => setShowSendFormModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            {language === 'english' ? 'Send to Patient' : 'Enviar al Paciente'}
          </button>
        )}
      </div>
      
      <WizardProgressBar
        steps={stepTitles}
        currentStep={currentStep}
        onStepClick={goToStep}
        language={language}
      />
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {/* Render current step */}
        {formSections.map((section, index) => (
          <WizardFormStep
            key={section.id}
            title={section.title}
            spanishTitle={section.spanishTitle}
            isActive={currentStep === index}
            language={language}
          >
            {index === formSections.length - 1 ? (
              renderReviewSection()
            ) : (
              <div className="space-y-4">
                {section.fields.map(field => renderField(field))}
              </div>
            )}
          </WizardFormStep>
        ))}
        
        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {language === 'english' ? 'Previous' : 'Anterior'}
            </button>
          ) : (
            <div></div> // Empty div to maintain flex spacing
          )}
          
          {currentStep < formSections.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {language === 'english' ? 'Next' : 'Siguiente'}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
            >
              {isSaving ? (
                language === 'english' ? 'Saving...' : 'Guardando...'
              ) : (
                language === 'english' ? 'Save Patient' : 'Guardar Paciente'
              )}
            </button>
          )}
        </div>
      </form>
      
      {/* Send Form Modal */}
      {showSendFormModal && (
        <SendFormModal
          isOpen={showSendFormModal}
          onClose={() => setShowSendFormModal(false)}
          onSend={handleSendForm}
        />
      )}
    </div>
  );
};

export default PatientWizardForm;