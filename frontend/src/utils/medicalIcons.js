import {
  Heart,
  Baby,
  Smile,
  Scissors,
  Droplet,
  Brain,
  Bone,
  Eye,
  Utensils,
  Ear,
  Pill,
  Wind,
  Zap,
  Droplets,
  Shield,
  Activity,
  Stethoscope
} from 'lucide-react';

// Map of specialty to Lucide icon component
export const getIconComponent = (specialty) => {
  const iconMap = {
    'Cardiologist': Heart,
    'Pediatrician': Baby,
    'Obstetrician': Smile,
    'Surgeon': Scissors,
    'Dermatologist': Droplet,
    'Psychiatrist': Brain,
    'Orthopedist': Bone,
    'Ophthalmologist': Eye,
    'Gastroenterologist': Utensils,
    'Neurologist': Brain,
    'ENT': Ear,
    'Pharmacist': Pill,
    'Pulmonologist': Wind,
    'Radiologist': Zap,
    'Anesthesiologist': Droplet,
    'Infectious Disease Specialist': Shield,
    'Urologist': Droplets,
    'Rheumatologist': Activity,
    'Hematologist': Droplet,
    'General Practitioner': Stethoscope
  };

  // Find matching specialty
  for (const [key, value] of Object.entries(iconMap)) {
    if (specialty && specialty.includes(key)) {
      return value;
    }
  }

  // Default icon
  return Stethoscope;
};

// Medical specialty color schemes
export const getMedicalIcon = (specialty) => {
  const colorMap = {
    'Cardiologist': {
      bgColor: 'from-red-100 to-rose-100',
      textColor: 'text-red-600',
      badgeColor: 'bg-red-50 text-red-700'
    },
    'Pediatrician': {
      bgColor: 'from-pink-100 to-purple-100',
      textColor: 'text-pink-600',
      badgeColor: 'bg-pink-50 text-pink-700'
    },
    'Obstetrician': {
      bgColor: 'from-purple-100 to-pink-100',
      textColor: 'text-purple-600',
      badgeColor: 'bg-purple-50 text-purple-700'
    },
    'Surgeon': {
      bgColor: 'from-blue-100 to-cyan-100',
      textColor: 'text-blue-600',
      badgeColor: 'bg-blue-50 text-blue-700'
    },
    'Dermatologist': {
      bgColor: 'from-yellow-100 to-orange-100',
      textColor: 'text-yellow-600',
      badgeColor: 'bg-yellow-50 text-yellow-700'
    },
    'Psychiatrist': {
      bgColor: 'from-indigo-100 to-purple-100',
      textColor: 'text-indigo-600',
      badgeColor: 'bg-indigo-50 text-indigo-700'
    },
    'Orthopedist': {
      bgColor: 'from-amber-100 to-orange-100',
      textColor: 'text-amber-600',
      badgeColor: 'bg-amber-50 text-amber-700'
    },
    'Ophthalmologist': {
      bgColor: 'from-green-100 to-teal-100',
      textColor: 'text-green-600',
      badgeColor: 'bg-green-50 text-green-700'
    },
    'Gastroenterologist': {
      bgColor: 'from-orange-100 to-red-100',
      textColor: 'text-orange-600',
      badgeColor: 'bg-orange-50 text-orange-700'
    },
    'Neurologist': {
      bgColor: 'from-violet-100 to-purple-100',
      textColor: 'text-violet-600',
      badgeColor: 'bg-violet-50 text-violet-700'
    },
    'ENT': {
      bgColor: 'from-cyan-100 to-blue-100',
      textColor: 'text-cyan-600',
      badgeColor: 'bg-cyan-50 text-cyan-700'
    },
    'Pharmacist': {
      bgColor: 'from-green-100 to-emerald-100',
      textColor: 'text-green-600',
      badgeColor: 'bg-green-50 text-green-700'
    },
    'Pulmonologist': {
      bgColor: 'from-sky-100 to-blue-100',
      textColor: 'text-sky-600',
      badgeColor: 'bg-sky-50 text-sky-700'
    },
    'Radiologist': {
      bgColor: 'from-slate-100 to-gray-100',
      textColor: 'text-slate-600',
      badgeColor: 'bg-slate-50 text-slate-700'
    },
    'Anesthesiologist': {
      bgColor: 'from-lime-100 to-green-100',
      textColor: 'text-lime-600',
      badgeColor: 'bg-lime-50 text-lime-700'
    },
    'Infectious Disease Specialist': {
      bgColor: 'from-red-100 to-orange-100',
      textColor: 'text-red-600',
      badgeColor: 'bg-red-50 text-red-700'
    },
    'Urologist': {
      bgColor: 'from-blue-100 to-cyan-100',
      textColor: 'text-blue-600',
      badgeColor: 'bg-blue-50 text-blue-700'
    },
    'Rheumatologist': {
      bgColor: 'from-orange-100 to-amber-100',
      textColor: 'text-orange-600',
      badgeColor: 'bg-orange-50 text-orange-700'
    },
    'Hematologist': {
      bgColor: 'from-rose-100 to-red-100',
      textColor: 'text-rose-600',
      badgeColor: 'bg-rose-50 text-rose-700'
    },
    'General Practitioner': {
      bgColor: 'from-teal-100 to-cyan-100',
      textColor: 'text-teal-600',
      badgeColor: 'bg-teal-50 text-teal-700'
    }
  };

  // Find matching specialty
  for (const [key, value] of Object.entries(colorMap)) {
    if (specialty && specialty.includes(key)) {
      return value;
    }
  }

  // Default colors
  return {
    bgColor: 'from-teal-100 to-cyan-100',
    textColor: 'text-teal-600',
    badgeColor: 'bg-teal-50 text-teal-700'
  };
};

// Get background color gradient for specialty
export const getSpecialtyBgColor = (specialty) => {
  const colors = getMedicalIcon(specialty);
  return colors.bgColor;
};

// Get text color for specialty
export const getSpecialtyTextColor = (specialty) => {
  const colors = getMedicalIcon(specialty);
  return colors.textColor;
};

// Get badge color for specialty
export const getSpecialtyBadgeColor = (specialty) => {
  const colors = getMedicalIcon(specialty);
  return colors.badgeColor;
};

// Legacy function for compatibility
export const getSpecialtyIcon = (specialty) => {
  const IconComponent = getIconComponent(specialty);
  return IconComponent;
};
