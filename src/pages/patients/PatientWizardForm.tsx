import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import WizardProgressBar from '../../components/patients/WizardProgressBar';
import WizardFormStep from '../../components/patients/WizardFormStep';
import { useAuth } from '../../contexts/AuthContext';

// Define form section interface
interface FormSection {
  id: string;
  title: string;
  spanishTitle?: string;
  description?: string;
  spanishDescription?: string;
  questions: FormQuestion[];
}

// Define question types
type QuestionType = 
  | 'text' 
  | 'textarea' 
  | 'select' 
  | 'radio' 
  | 'checkbox' 
  | 'date' 
  | 'email' 
  | 'tel'
  | 'number'
  | 'address'
  | 'array'
  | 'nested';

// Define question interface
interface FormQuestion {
  id: string;
  type: QuestionType;
  label: string;
  spanishLabel?: string;
  placeholder?: string;
  spanishPlaceholder?: string;
  required?: boolean;
  options?: { value: string; label: string; spanishLabel?: string }[];
  subQuestions?: FormQuestion[];
  path?: string; // Path to store in patient object (e.g., 'medicalHistory.allergies')
  maxItems?: number; // For array type questions
  defaultValue?: any;
}

const PatientWizardForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState<'english' | 'spanish'>('english');
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Define form sections dynamically
  const formSections: FormSection[] = [
    {
      id: 'language',
      title: 'Language Preference',
      spanishTitle: 'Preferencia de Idioma',
      questions: [
        {
          id: 'preferredLanguage',
          type: 'radio',
          label: 'Please select your preferred language',
          spanishLabel: 'Por favor seleccione su idioma preferido',
          required: true,
          options: [
            { value: 'english', label: 'English', spanishLabel: 'Inglés' },
            { value: 'spanish', label: 'Spanish', spanishLabel: 'Español' }
          ],
          path: 'preferredLanguage'
        }
      ]
    },
    {
      id: 'personalInfo',
      title: 'Personal Information',
      spanishTitle: 'Información Personal',
      questions: [
        {
          id: 'firstName',
          type: 'text',
          label: 'First Name',
          spanishLabel: 'Nombre',
          required: true,
          placeholder: 'Enter your first name',
          spanishPlaceholder: 'Ingrese su nombre',
          path: 'firstName'
        },
        {
          id: 'lastName',
          type: 'text',
          label: 'Last Name',
          spanishLabel: 'Apellido',
          required: true,
          placeholder: 'Enter your last name',
          spanishPlaceholder: 'Ingrese su apellido',
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
            { value: '', label: 'Select marital status', spanishLabel: 'Seleccione estado civil' },
            { value: 'single', label: 'Single', spanishLabel: 'Soltero/a' },
            { value: 'married', label: 'Married', spanishLabel: 'Casado/a' },
            { value: 'divorced', label: 'Divorced', spanishLabel: 'Divorciado/a' },
            { value: 'widowed', label: 'Widowed', spanishLabel: 'Viudo/a' },
            { value: 'separated', label: 'Separated', spanishLabel: 'Separado/a' }
          ],
          path: 'maritalStatus'
        }
      ]
    },
    {
      id: 'contactInfo',
      title: 'Contact Information',
      spanishTitle: 'Información de Contacto',
      questions: [
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          spanishLabel: 'Correo Electrónico',
          required: true,
          placeholder: 'Enter your email address',
          spanishPlaceholder: 'Ingrese su correo electrónico',
          path: 'email'
        },
        {
          id: 'phone',
          type: 'tel',
          label: 'Phone Number',
          spanishLabel: 'Número de Teléfono',
          required: true,
          placeholder: 'Enter your phone number',
          spanishPlaceholder: 'Ingrese su número de teléfono',
          path: 'phone'
        },
        {
          id: 'address',
          type: 'address',
          label: 'Address',
          spanishLabel: 'Dirección',
          required: true,
          subQuestions: [
            {
              id: 'street',
              type: 'text',
              label: 'Street Address',
              spanishLabel: 'Dirección',
              placeholder: 'Enter your street address',
              spanishPlaceholder: 'Ingrese su dirección',
              path: 'address.street'
            },
            {
              id: 'city',
              type: 'text',
              label: 'City',
              spanishLabel: 'Ciudad',
              placeholder: 'Enter your city',
              spanishPlaceholder: 'Ingrese su ciudad',
              path: 'address.city'
            },
            {
              id: 'state',
              type: 'text',
              label: 'State',
              spanishLabel: 'Estado',
              placeholder: 'Enter your state',
              spanishPlaceholder: 'Ingrese su estado',
              path: 'address.state'
            },
            {
              id: 'zipCode',
              type: 'text',
              label: 'Zip Code',
              spanishLabel: 'Código Postal',
              placeholder: 'Enter your zip code',
              spanishPlaceholder: 'Ingrese su código postal',
              path: 'address.zipCode'
            },
            {
              id: 'country',
              type: 'text',
              label: 'Country',
              spanishLabel: 'País',
              placeholder: 'Enter your country',
              spanishPlaceholder: 'Ingrese su país',
              defaultValue: 'USA',
              path: 'address.country'
            }
          ]
        }
      ]
    },
    {
      id: 'emergencyContact',
      title: 'Emergency Contact',
      spanishTitle: 'Contacto de Emergencia',
      questions: [
        {
          id: 'emergencyContactName',
          type: 'text',
          label: 'Emergency Contact Name',
          spanishLabel: 'Nombre del Contacto de Emergencia',
          required: true,
          placeholder: 'Enter emergency contact name',
          spanishPlaceholder: 'Ingrese el nombre del contacto de emergencia',
          path: 'emergencyContact.name'
        },
        {
          id: 'emergencyContactRelationship',
          type: 'text',
          label: 'Relationship to You',
          spanishLabel: 'Relación con Usted',
          required: true,
          placeholder: 'Enter relationship',
          spanishPlaceholder: 'Ingrese la relación',
          path: 'emergencyContact.relationship'
        },
        {
          id: 'emergencyContactPhone',
          type: 'tel',
          label: 'Emergency Contact Phone',
          spanishLabel: 'Teléfono del Contacto de Emergencia',
          required: true,
          placeholder: 'Enter emergency contact phone',
          spanishPlaceholder: 'Ingrese el teléfono del contacto de emergencia',
          path: 'emergencyContact.phone'
        }
      ]
    },
    {
      id: 'insurance',
      title: 'Insurance Information',
      spanishTitle: 'Información del Seguro',
      questions: [
        {
          id: 'hasInsurance',
          type: 'radio',
          label: 'Do you have medical insurance?',
          spanishLabel: '¿Tiene seguro médico?',
          required: true,
          options: [
            { value: 'yes', label: 'Yes', spanishLabel: 'Sí' },
            { value: 'no', label: 'No', spanishLabel: 'No' }
          ],
          path: 'hasInsurance'
        },
        {
          id: 'insuranceInfo',
          type: 'nested',
          label: 'Insurance Details',
          spanishLabel: 'Detalles del Seguro',
          subQuestions: [
            {
              id: 'insuranceProvider',
              type: 'text',
              label: 'Insurance Provider',
              spanishLabel: 'Proveedor de Seguro',
              placeholder: 'Enter insurance provider',
              spanishPlaceholder: 'Ingrese el proveedor de seguro',
              path: 'insurance.provider'
            },
            {
              id: 'insurancePolicyNumber',
              type: 'text',
              label: 'Policy Number',
              spanishLabel: 'Número de Póliza',
              placeholder: 'Enter policy number',
              spanishPlaceholder: 'Ingrese el número de póliza',
              path: 'insurance.policyNumber'
            },
            {
              id: 'insuranceGroupNumber',
              type: 'text',
              label: 'Group Number',
              spanishLabel: 'Número de Grupo',
              placeholder: 'Enter group number',
              spanishPlaceholder: 'Ingrese el número de grupo',
              path: 'insurance.groupNumber'
            }
          ]
        }
      ]
    },
    {
      id: 'attorney',
      title: 'Attorney Information',
      spanishTitle: 'Información del Abogado',
      questions: [
        {
          id: 'hasAttorney',
          type: 'radio',
          label: 'Do you have an attorney for this case?',
          spanishLabel: '¿Tiene un abogado para este caso?',
          required: true,
          options: [
            { value: 'yes', label: 'Yes', spanishLabel: 'Sí' },
            { value: 'no', label: 'No', spanishLabel: 'No' }
          ],
          path: 'hasAttorney'
        },
        {
          id: 'attorneyInfo',
          type: 'nested',
          label: 'Attorney Details',
          spanishLabel: 'Detalles del Abogado',
          subQuestions: [
            {
              id: 'attorneyName',
              type: 'text',
              label: 'Attorney Name',
              spanishLabel: 'Nombre del Abogado',
              placeholder: 'Enter attorney name',
              spanishPlaceholder: 'Ingrese el nombre del abogado',
              path: 'attorney.name'
            },
            {
              id: 'attorneyFirm',
              type: 'text',
              label: 'Law Firm',
              spanishLabel: 'Bufete de Abogados',
              placeholder: 'Enter law firm name',
              spanishPlaceholder: 'Ingrese el nombre del bufete de abogados',
              path: 'attorney.firm'
            },
            {
              id: 'attorneyPhone',
              type: 'tel',
              label: 'Attorney Phone',
              spanishLabel: 'Teléfono del Abogado',
              placeholder: 'Enter attorney phone',
              spanishPlaceholder: 'Ingrese el teléfono del abogado',
              path: 'attorney.phone'
            },
            {
              id: 'attorneyEmail',
              type: 'email',
              label: 'Attorney Email',
              spanishLabel: 'Correo Electrónico del Abogado',
              placeholder: 'Enter attorney email',
              spanishPlaceholder: 'Ingrese el correo electrónico del abogado',
              path: 'attorney.email'
            },
            {
              id: 'attorneyAddress',
              type: 'address',
              label: 'Attorney Address',
              spanishLabel: 'Dirección del Abogado',
              subQuestions: [
                {
                  id: 'attorneyStreet',
                  type: 'text',
                  label: 'Street Address',
                  spanishLabel: 'Dirección',
                  placeholder: 'Enter street address',
                  spanishPlaceholder: 'Ingrese la dirección',
                  path: 'attorney.address.street'
                },
                {
                  id: 'attorneyCity',
                  type: 'text',
                  label: 'City',
                  spanishLabel: 'Ciudad',
                  placeholder: 'Enter city',
                  spanishPlaceholder: 'Ingrese la ciudad',
                  path: 'attorney.address.city'
                },
                {
                  id: 'attorneyState',
                  type: 'text',
                  label: 'State',
                  spanishLabel: 'Estado',
                  placeholder: 'Enter state',
                  spanishPlaceholder: 'Ingrese el estado',
                  path: 'attorney.address.state'
                },
                {
                  id: 'attorneyZipCode',
                  type: 'text',
                  label: 'Zip Code',
                  spanishLabel: 'Código Postal',
                  placeholder: 'Enter zip code',
                  spanishPlaceholder: 'Ingrese el código postal',
                  path: 'attorney.address.zipCode'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'medicalHistory',
      title: 'Medical History',
      spanishTitle: 'Historia Médica',
      questions: [
        {
          id: 'allergies',
          type: 'array',
          label: 'Allergies',
          spanishLabel: 'Alergias',
          placeholder: 'Enter allergy',
          spanishPlaceholder: 'Ingrese alergia',
          path: 'medicalHistory.allergies',
          maxItems: 10
        },
        {
          id: 'medications',
          type: 'array',
          label: 'Current Medications',
          spanishLabel: 'Medicamentos Actuales',
          placeholder: 'Enter medication',
          spanishPlaceholder: 'Ingrese medicamento',
          path: 'medicalHistory.medications',
          maxItems: 10
        },
        {
          id: 'conditions',
          type: 'array',
          label: 'Medical Conditions',
          spanishLabel: 'Condiciones Médicas',
          placeholder: 'Enter condition',
          spanishPlaceholder: 'Ingrese condición',
          path: 'medicalHistory.conditions',
          maxItems: 10
        },
        {
          id: 'surgeries',
          type: 'array',
          label: 'Past Surgeries',
          spanishLabel: 'Cirugías Previas',
          placeholder: 'Enter surgery',
          spanishPlaceholder: 'Ingrese cirugía',
          path: 'medicalHistory.surgeries',
          maxItems: 10
        },
        {
          id: 'familyHistory',
          type: 'array',
          label: 'Family Medical History',
          spanishLabel: 'Historia Médica Familiar',
          placeholder: 'Enter family history',
          spanishPlaceholder: 'Ingrese historia familiar',
          path: 'medicalHistory.familyHistory',
          maxItems: 10
        }
      ]
    },
    {
      id: 'injuryInfo',
      title: 'Injury Information',
      spanishTitle: 'Información de la Lesión',
      questions: [
        {
          id: 'injuryDate',
          type: 'date',
          label: 'Date of Injury',
          spanishLabel: 'Fecha de la Lesión',
          path: 'injuryDate'
        },
        {
          id: 'injuryDescription',
          type: 'textarea',
          label: 'Describe how the injury occurred',
          spanishLabel: 'Describa cómo ocurrió la lesión',
          placeholder: 'Please provide details about how the injury happened',
          spanishPlaceholder: 'Por favor proporcione detalles sobre cómo ocurrió la lesión',
          path: 'injuryDescription'
        }
      ]
    },
    {
      id: 'subjectiveInfo',
      title: 'Subjective Information',
      spanishTitle: 'Información Subjetiva',
      questions: [
        {
          id: 'bodyParts',
          type: 'array',
          label: 'Affected Body Parts',
          spanishLabel: 'Partes del Cuerpo Afectadas',
          path: 'subjective.bodyPart',
          maxItems: 10,
          subQuestions: [
            {
              id: 'part',
              type: 'text',
              label: 'Body Part',
              spanishLabel: 'Parte del Cuerpo',
              placeholder: 'e.g., Neck, Back, Shoulder',
              spanishPlaceholder: 'ej., Cuello, Espalda, Hombro',
              path: 'part'
            },
            {
              id: 'side',
              type: 'select',
              label: 'Side',
              spanishLabel: 'Lado',
              options: [
                { value: '', label: 'Select side', spanishLabel: 'Seleccione lado' },
                { value: 'left', label: 'Left', spanishLabel: 'Izquierdo' },
                { value: 'right', label: 'Right', spanishLabel: 'Derecho' },
                { value: 'both', label: 'Both', spanishLabel: 'Ambos' },
                { value: 'n/a', label: 'N/A', spanishLabel: 'N/A' }
              ],
              path: 'side'
            }
          ]
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
          label: 'Timing',
          spanishLabel: 'Frecuencia',
          options: [
            { value: '', label: 'Select timing', spanishLabel: 'Seleccione frecuencia' },
            { value: 'constant', label: 'Constant', spanishLabel: 'Constante' },
            { value: 'intermittent', label: 'Intermittent', spanishLabel: 'Intermitente' },
            { value: 'worse-morning', label: 'Worse in the morning', spanishLabel: 'Peor en la mañana' },
            { value: 'worse-evening', label: 'Worse in the evening', spanishLabel: 'Peor en la noche' },
            { value: 'worse-activity', label: 'Worse with activity', spanishLabel: 'Peor con actividad' },
            { value: 'worse-rest', label: 'Worse with rest', spanishLabel: 'Peor con descanso' }
          ],
          path: 'subjective.timing'
        },
        {
          id: 'context',
          type: 'textarea',
          label: 'Context',
          spanishLabel: 'Contexto',
          placeholder: 'Describe the context of your symptoms',
          spanishPlaceholder: 'Describa el contexto de sus síntomas',
          path: 'subjective.context'
        },
        {
          id: 'exacerbatedBy',
          type: 'checkbox',
          label: 'Exacerbated By',
          spanishLabel: 'Exacerbado Por',
          options: [
            { value: 'sitting', label: 'Sitting', spanishLabel: 'Sentarse' },
            { value: 'standing', label: 'Standing', spanishLabel: 'Estar de pie' },
            { value: 'walking', label: 'Walking', spanishLabel: 'Caminar' },
            { value: 'bending', label: 'Bending', spanishLabel: 'Inclinarse' },
            { value: 'lifting', label: 'Lifting', spanishLabel: 'Levantar' },
            { value: 'twisting', label: 'Twisting', spanishLabel: 'Torcer' },
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
            { value: 'fatigue', label: 'Fatigue', spanishLabel: 'Fatiga' },
            { value: 'weakness', label: 'Weakness', spanishLabel: 'Debilidad' },
            { value: 'stiffness', label: 'Stiffness', spanishLabel: 'Rigidez' },
            { value: 'swelling', label: 'Swelling', spanishLabel: 'Hinchazón' },
            { value: 'limited-mobility', label: 'Limited mobility', spanishLabel: 'Movilidad limitada' }
          ],
          path: 'subjective.symptoms'
        },
        {
          id: 'radiatingTo',
          type: 'text',
          label: 'Radiating To',
          spanishLabel: 'Irradiando A',
          placeholder: 'Describe where the pain radiates to',
          spanishPlaceholder: 'Describa hacia dónde se irradia el dolor',
          path: 'subjective.radiatingTo'
        },
        {
          id: 'radiatingDirection',
          type: 'checkbox',
          label: 'Radiating Direction',
          spanishLabel: 'Dirección de Irradiación',
          options: [
            { value: 'radiatingRight', label: 'Right', spanishLabel: 'Derecha' },
            { value: 'radiatingLeft', label: 'Left', spanishLabel: 'Izquierda' }
          ],
          path: 'subjective.radiatingDirection'
        },
        {
          id: 'sciatica',
          type: 'checkbox',
          label: 'Sciatica',
          spanishLabel: 'Ciática',
          options: [
            { value: 'sciaticaRight', label: 'Right', spanishLabel: 'Derecha' },
            { value: 'sciaticaLeft', label: 'Left', spanishLabel: 'Izquierda' }
          ],
          path: 'subjective.sciatica'
        },
        {
          id: 'notes',
          type: 'textarea',
          label: 'Additional Notes',
          spanishLabel: 'Notas Adicionales',
          placeholder: 'Any additional information about your symptoms',
          spanishPlaceholder: 'Cualquier información adicional sobre sus síntomas',
          path: 'subjective.notes'
        }
      ]
    },
    {
      id: 'doctorAssignment',
      title: 'Doctor Assignment',
      spanishTitle: 'Asignación de Doctor',
      questions: [
        {
          id: 'assignedDoctor',
          type: 'select',
          label: 'Assigned Doctor',
          spanishLabel: 'Doctor Asignado',
          required: true,
          options: [], // Will be populated dynamically
          path: 'assignedDoctor'
        }
      ]
    },
    {
      id: 'review',
      title: 'Review Information',
      spanishTitle: 'Revisar Información',
      questions: [] // No questions, just review
    }
  ];

  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/doctors');
        setDoctors(response.data);
        
        // Update the doctor options in the form
        const doctorOptions = response.data.map((doctor: any) => ({
          value: doctor._id,
          label: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          spanishLabel: `Dr. ${doctor.firstName} ${doctor.lastName}`
        }));
        
        // Find the doctor assignment section and update its options
        const updatedSections = [...formSections];
        const doctorSectionIndex = updatedSections.findIndex(section => section.id === 'doctorAssignment');
        if (doctorSectionIndex !== -1) {
          updatedSections[doctorSectionIndex].questions[0].options = doctorOptions;
        }
        
        // If user is a doctor, set the assigned doctor to the current user
        if (user?.role === 'doctor') {
          setFormData(prev => ({
            ...prev,
            assignedDoctor: user.id
          }));
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast.error('Failed to fetch doctors');
      }
    };
    
    fetchDoctors();
    
    // If in edit mode, fetch patient data
    if (isEditMode && id) {
      fetchPatientData(id);
    }
  }, [isEditMode, id, user]);

  // Fetch patient data if in edit mode
  const fetchPatientData = async (patientId: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/patients/${patientId}`);
      setFormData(response.data);
      
      // Set language based on patient's preferred language
      if (response.data.preferredLanguage) {
        setLanguage(response.data.preferredLanguage);
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to fetch patient data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form field changes
  const handleChange = (path: string, value: any) => {
    // Update form data using the path
    setFormData(prev => {
      const newData = { ...prev };
      setNestedValue(newData, path, value);
      
      // If changing language preference, update the language state
      if (path === 'preferredLanguage') {
        setLanguage(value);
      }
      
      return newData;
    });
    
    // Set up auto-save timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      autoSaveData();
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    setAutoSaveTimer(timer);
  };

  // Set a nested value in an object using a path string (e.g., 'address.street')
  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  };

  // Get a nested value from an object using a path string
  const getNestedValue = (obj: any, path: string) => {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  };

  // Auto-save data to the server
  const autoSaveData = async () => {
    // Only auto-save if we have enough data
    if (!formData.firstName || !formData.lastName) {
      return;
    }
    
    try {
      let response;
      
      if (isEditMode && id) {
        // Update existing patient
        response = await axios.put(`http://localhost:5000/api/patients/${id}`, formData);
      } else {
        // Create new patient
        response = await axios.post('http://localhost:5000/api/patients', formData);
        
        // If this is a new patient, update the URL to edit mode
        if (response.data.patient && response.data.patient._id) {
          navigate(`/patients/${response.data.patient._id}/edit`, { replace: true });
        }
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error auto-saving data:', error);
      // Don't show toast for auto-save errors to avoid spamming the user
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      let response;
      
      if (isEditMode && id) {
        // Update existing patient
        response = await axios.put(`http://localhost:5000/api/patients/${id}`, formData);
        toast.success('Patient updated successfully');
      } else {
        // Create new patient
        response = await axios.post('http://localhost:5000/api/patients', formData);
        toast.success('Patient created successfully');
      }
      
      // Navigate to patient details page
      navigate(`/patients/${isEditMode ? id : response.data.patient._id}`);
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error('Failed to save patient');
    } finally {
      setIsSaving(false);
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

  // Render a form question based on its type
  const renderQuestion = (question: FormQuestion) => {
    const label = language === 'spanish' && question.spanishLabel ? question.spanishLabel : question.label;
    const placeholder = language === 'spanish' && question.spanishPlaceholder ? question.spanishPlaceholder : question.placeholder;
    const value = question.path ? getNestedValue(formData, question.path) : '';
    
    switch (question.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
      case 'date':
        return (
          <div className="mb-4">
            <label htmlFor={question.id} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {question.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={question.type}
              id={question.id}
              value={value || ''}
              onChange={(e) => handleChange(question.path!, e.target.value)}
              placeholder={placeholder}
              required={question.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );
      
      case 'textarea':
        return (
          <div className="mb-4">
            <label htmlFor={question.id} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {question.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id={question.id}
              value={value || ''}
              onChange={(e) => handleChange(question.path!, e.target.value)}
              placeholder={placeholder}
              required={question.required}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );
      
      case 'select':
        return (
          <div className="mb-4">
            <label htmlFor={question.id} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {question.required && <span className="text-red-500">*</span>}
            </label>
            <select
              id={question.id}
              value={value || ''}
              onChange={(e) => handleChange(question.path!, e.target.value)}
              required={question.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {question.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {language === 'spanish' && option.spanishLabel ? option.spanishLabel : option.label}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'radio':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label} {question.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {question.options?.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={value === option.value}
                    onChange={() => handleChange(question.path!, option.value)}
                    required={question.required}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">
                    {language === 'spanish' && option.spanishLabel ? option.spanishLabel : option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label} {question.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {question.options?.map((option) => {
                // For checkboxes that map to individual boolean fields
                if (option.value.startsWith('radiating') || option.value.startsWith('sciatica')) {
                  const checkboxValue = getNestedValue(formData, `subjective.${option.value}`) || false;
                  return (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        name={option.value}
                        checked={checkboxValue}
                        onChange={(e) => handleChange(`subjective.${option.value}`, e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">
                        {language === 'spanish' && option.spanishLabel ? option.spanishLabel : option.label}
                      </span>
                    </label>
                  );
                }
                
                // For checkboxes that map to arrays
                const arrayValue = Array.isArray(value) ? value : [];
                return (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      name={option.value}
                      checked={arrayValue.includes(option.value)}
                      onChange={(e) => {
                        const newValue = e.target.checked
                          ? [...arrayValue, option.value]
                          : arrayValue.filter(v => v !== option.value);
                        handleChange(question.path!, newValue);
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">
                      {language === 'spanish' && option.spanishLabel ? option.spanishLabel : option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      
      case 'address':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label} {question.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-4 p-4 border border-gray-300 rounded-md">
              {question.subQuestions?.map((subQuestion) => renderQuestion(subQuestion))}
            </div>
          </div>
        );
      
      case 'array':
        const arrayValue = Array.isArray(value) ? value : [];
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label} {question.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {arrayValue.map((item, index) => (
                <div key={index} className="flex items-center">
                  {question.subQuestions ? (
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      {question.subQuestions.map((subQuestion) => {
                        const subPath = `${question.path}[${index}].${subQuestion.path}`;
                        const subValue = getNestedValue(formData, subPath);
                        const subLabel = language === 'spanish' && subQuestion.spanishLabel ? subQuestion.spanishLabel : subQuestion.label;
                        const subPlaceholder = language === 'spanish' && subQuestion.spanishPlaceholder ? subQuestion.spanishPlaceholder : subQuestion.placeholder;
                        
                        if (subQuestion.type === 'select') {
                          return (
                            <div key={subQuestion.id} className="flex-1">
                              <label className="block text-xs font-medium text-gray-700 mb-1">{subLabel}</label>
                              <select
                                value={subValue || ''}
                                onChange={(e) => handleChange(subPath, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              >
                                {subQuestion.options?.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {language === 'spanish' && option.spanishLabel ? option.spanishLabel : option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        }
                        
                        return (
                          <div key={subQuestion.id} className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">{subLabel}</label>
                            <input
                              type="text"
                              value={subValue || ''}
                              onChange={(e) => handleChange(subPath, e.target.value)}
                              placeholder={subPlaceholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newArray = [...arrayValue];
                        newArray[index] = e.target.value;
                        handleChange(question.path!, newArray);
                      }}
                      placeholder={placeholder}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const newArray = [...arrayValue];
                      newArray.splice(index, 1);
                      handleChange(question.path!, newArray);
                    }}
                    className="ml-2 p-2 text-red-600 hover:text-red-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
              {(!question.maxItems || arrayValue.length < question.maxItems) && (
                <button
                  type="button"
                  onClick={() => {
                    const newItem = question.subQuestions ? {} : '';
                    handleChange(question.path!, [...arrayValue, newItem]);
                  }}
                  className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                >
                  {language === 'spanish' ? 'Agregar' : 'Add'} {label.toLowerCase()}
                </button>
              )}
            </div>
          </div>
        );
      
      case 'nested':
        // Only show nested questions if they should be visible (e.g., based on a parent question)
        const shouldShowNested = () => {
          if (question.id === 'insuranceInfo') {
            return getNestedValue(formData, 'hasInsurance') === 'yes';
          }
          if (question.id === 'attorneyInfo') {
            return getNestedValue(formData, 'hasAttorney') === 'yes';
          }
          return true;
        };
        
        if (!shouldShowNested()) {
          return null;
        }
        
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label} {question.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-4 p-4 border border-gray-300 rounded-md">
              {question.subQuestions?.map((subQuestion) => renderQuestion(subQuestion))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Render the review section
  const renderReview = () => {
    return (
      <div className="space-y-6">
        <p className="text-gray-700">
          {language === 'spanish'
            ? 'Por favor revise la información que ha proporcionado. Si necesita hacer cambios, puede navegar a la sección correspondiente utilizando la barra de progreso.'
            : 'Please review the information you have provided. If you need to make changes, you can navigate to the corresponding section using the progress bar.'}
        </p>
        
        {formSections.slice(0, -1).map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'spanish' && section.spanishTitle ? section.spanishTitle : section.title}
            </h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              {section.questions.map((question) => {
                // Skip nested questions in the review
                if (question.type === 'nested') return null;
                
                // Skip questions that shouldn't be shown based on conditions
                if (question.id === 'insuranceInfo' && getNestedValue(formData, 'hasInsurance') !== 'yes') return null;
                if (question.id === 'attorneyInfo' && getNestedValue(formData, 'hasAttorney') !== 'yes') return null;
                
                const label = language === 'spanish' && question.spanishLabel ? question.spanishLabel : question.label;
                let value = question.path ? getNestedValue(formData, question.path) : '';
                
                // Format the value based on question type
                if (question.type === 'select' && question.options) {
                  const option = question.options.find(opt => opt.value === value);
                  if (option) {
                    value = language === 'spanish' && option.spanishLabel ? option.spanishLabel : option.label;
                  }
                } else if (question.type === 'radio' && question.options) {
                  const option = question.options.find(opt => opt.value === value);
                  if (option) {
                    value = language === 'spanish' && option.spanishLabel ? option.spanishLabel : option.label;
                  }
                } else if (question.type === 'checkbox' && question.options && Array.isArray(value)) {
                  const selectedOptions = question.options.filter(opt => value.includes(opt.value));
                  value = selectedOptions.map(opt => 
                    language === 'spanish' && opt.spanishLabel ? opt.spanishLabel : opt.label
                  ).join(', ');
                } else if (question.type === 'array' && Array.isArray(value)) {
                  if (question.subQuestions) {
                    // Complex array with subquestions
                    value = value.map((item: any) => {
                      const parts = [];
                      for (const subQ of question.subQuestions!) {
                        const subValue = item[subQ.path!];
                        if (subValue) {
                          if (subQ.type === 'select' && subQ.options) {
                            const option = subQ.options.find(opt => opt.value === subValue);
                            if (option) {
                              parts.push(`${language === 'spanish' && subQ.spanishLabel ? subQ.spanishLabel : subQ.label}: ${language === 'spanish' && option.spanishLabel ? option.spanishLabel : option.label}`);
                            }
                          } else {
                            parts.push(`${language === 'spanish' && subQ.spanishLabel ? subQ.spanishLabel : subQ.label}: ${subValue}`);
                          }
                        }
                      }
                      return parts.join(', ');
                    }).join('; ');
                  } else {
                    // Simple array
                    value = value.join(', ');
                  }
                } else if (question.type === 'date' && value) {
                  value = new Date(value).toLocaleDateString();
                }
                
                return (
                  <div key={question.id} className="py-2">
                    <dt className="text-sm font-medium text-gray-500">{label}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{value || 'N/A'}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ))}
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditMode 
            ? (language === 'spanish' ? 'Editar Paciente' : 'Edit Patient') 
            : (language === 'spanish' ? 'Nuevo Paciente' : 'New Patient')}
        </h1>
        {lastSaved && (
          <p className="text-sm text-gray-500 mt-1">
            {language === 'spanish' ? 'Último guardado automático:' : 'Last auto-saved:'} {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>
      
      <WizardProgressBar 
        steps={formSections.map(section => language === 'spanish' && section.spanishTitle ? section.spanishTitle : section.title)} 
        currentStep={currentStep} 
        onStepClick={goToStep}
        language={language}
      />
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {formSections.map((section, index) => (
          <WizardFormStep 
            key={section.id}
            title={section.title} 
            spanishTitle={section.spanishTitle}
            isActive={currentStep === index}
            language={language}
          >
            {index === formSections.length - 1 ? (
              // Render review section
              renderReview()
            ) : (
              // Render questions for this section
              <div className="space-y-4">
                {section.description && (
                  <p className="text-gray-600 mb-4">
                    {language === 'spanish' && section.spanishDescription ? section.spanishDescription : section.description}
                  </p>
                )}
                {section.questions.map(question => renderQuestion(question))}
              </div>
            )}
            
            <div className="mt-8 flex justify-between">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {language === 'spanish' ? 'Anterior' : 'Previous'}
                </button>
              )}
              <div className="flex-1"></div>
              {currentStep < formSections.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {language === 'spanish' ? 'Siguiente' : 'Next'}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {language === 'spanish' ? 'Guardando...' : 'Saving...'}
                    </span>
                  ) : (
                    language === 'spanish' ? 'Guardar Paciente' : 'Save Patient'
                  )}
                </button>
              )}
            </div>
          </WizardFormStep>
        ))}
      </form>
    </div>
  );
};

export default PatientWizardForm;