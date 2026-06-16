export type EnterpriseType = 'limited' | 'individual' | 'partnership' | 'sole';

export type ProcessStatus = 'pending' | 'accepted' | 'reviewing' | 'returned' | 'completed';

export type ProcessStage = 'name_approval' | 'business_license' | 'seal_engraving' | 'tax_registration' | 'social_insurance' | 'housing_fund' | 'bank_appointment';

export interface Person {
  id: string;
  name: string;
  idType: string;
  idNumber: string;
  phone: string;
  email: string;
  role: 'legal_representative' | 'shareholder' | 'supervisor' | 'director';
  idCardFront?: string;
  idCardBack?: string;
}

export interface Shareholder extends Person {
  shareRatio: number;
  subscribedCapital: number;
}

export interface BusinessPremises {
  province: string;
  city: string;
  district: string;
  address: string;
  propertyType: 'owned' | 'rented' | 'provided';
  propertyOwner: string;
  propertyCertType: string;
  propertyCertNo: string;
  leaseTermStart?: string;
  leaseTermEnd?: string;
  propertyCertFile?: string;
  leaseContractFile?: string;
}

export interface BusinessScopeItem {
  code: string;
  name: string;
  category: string;
  isLicensed: boolean;
  licenseRequired?: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  category: string;
  required: boolean;
  status: 'missing' | 'uploaded' | 'verified';
  uploadedFile?: string;
  templateAvailable: boolean;
  templateFile?: string;
  remark?: string;
}

export interface ProcessStep {
  stage: ProcessStage;
  name: string;
  status: ProcessStatus;
  acceptTime?: string;
  expectedTime?: string;
  completeTime?: string;
  department: string;
  handler?: string;
  returnReason?: string;
  correctItems?: string[];
}

export interface EnterpriseApplication {
  id: string;
  applicationNo: string;
  enterpriseName: string;
  alternativeNames?: string[];
  enterpriseType: EnterpriseType;
  registeredCapital: number;
  businessScope: BusinessScopeItem[];
  businessTerm: string;
  legalRepresentative: Person;
  shareholders: Shareholder[];
  supervisors: Person[];
  directors: Person[];
  premises: BusinessPremises;
  selectedServices: ProcessStage[];
  materials: MaterialItem[];
  processSteps: ProcessStep[];
  status: ProcessStatus;
  createTime: string;
  submitTime?: string;
}

export interface Message {
  id: string;
  type: 'process' | 'policy' | 'system' | 'reminder';
  title: string;
  content: string;
  isRead: boolean;
  createTime: string;
  relatedApplicationId?: string;
  relatedStage?: ProcessStage;
  attachmentName?: string;
}

export interface Enterprise {
  id: string;
  name: string;
  unifiedCreditCode: string;
  type: EnterpriseType;
  establishDate: string;
  status: 'normal' | 'abnormal' | 'cancelled';
  legalRepresentative: string;
  registeredCapital: number;
  address: string;
  businessScope: string;
}

export interface UserTask {
  id: string;
  title: string;
  description: string;
  type: 'todo' | 'reminder';
  deadline?: string;
  status: 'pending' | 'completed';
  relatedPage?: string;
}

export interface EnterpriseTypeInfo {
  id: EnterpriseType;
  name: string;
  description: string;
  suitableFor: string;
  shareholderCount: string;
  liability: string;
  taxType: string;
}
