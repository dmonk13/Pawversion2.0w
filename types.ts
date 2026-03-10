
export type PetSpecies = 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other';

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  sex?: 'Male' | 'Female';
  age: number;
  weight: number;
  origin?: string;
  image: string;
  lastFed: string;
  nextVetVisit?: string;
  temperament?: string[];
  bio?: string;
}

export interface HealthLog {
  id: string;
  petId: string;
  type: 'Vaccination' | 'Checkup' | 'Medication' | 'Note' | 'Temperature' | 'Weight';
  date: string;
  description: string;
  value?: string; // For numeric values like 101.5
  attachments?: string[];
}

export interface Task {
  id: string;
  petId: string;
  title: string;
  type: 'Feeding' | 'Health' | 'Activity' | 'Grooming' | 'Other';
  date: string;
  time: string;
  isRecurring: boolean;
  frequency?: 'Daily' | 'Weekly' | 'Monthly';
  completed: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface DiscoverPet {
  id: string;
  name: string;
  breed: string;
  age: string;
  energy: 'Low' | 'Medium' | 'High';
  distance: string;
  image: string;
  bio: string;
  tags: string[];
  gender: 'Male' | 'Female';
  status: 'Neutered' | 'Intact';
  medicalHistory: string[];
}

export interface Match {
  id: string;
  name: string;
  image: string;
  type: 'pet' | 'ai';
  breed?: string; 
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: boolean;
}