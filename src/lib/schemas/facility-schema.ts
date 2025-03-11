export interface Facility {
    id?: number; // Auto-incremented in DB
    name: string;
    logo: string; // Path to stored logo
    address: string;
    city: string;
    state: string;
    zipcode: string;
    maxOccupancy: number;
    availableBeds: number;
    pictures: string[]; // Array of stored picture paths
    aboutUs: string;
    services: string[]; // List of services
    dailyActivities: string[]; // List of activities
    menu?: { // Optional menu structure
      day: string;
      breakfast: string[];
      lunch: string[];
      dinner: string[];
      snacks: string[];
    }[];
    contacts: { // Contact details
      type: "Phone" | "Email" | "Fax";
      value: string;
    }[];
    managerName: string;
    created_at?: Date;
    updated_at?: Date;
  }
  