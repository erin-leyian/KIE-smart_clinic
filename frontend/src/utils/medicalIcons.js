// Medical specialty icons and color schemes
export const getMedicalIcon = (specialty) => {
  const iconMap = {
    'Cardiologist': {
      svg: '❤️‍🩹',
      bgColor: 'from-red-100 to-rose-100',
      textColor: 'text-red-600',
      badgeColor: 'bg-red-50 text-red-700'
    },
    'Pediatrician': {
      svg: '🧒',
      bgColor: 'from-pink-100 to-purple-100',
      textColor: 'text-pink-600',
      badgeColor: 'bg-pink-50 text-pink-700'
    },
    'Obstetrician': {
      svg: '👶',
      bgColor: 'from-purple-100 to-pink-100',
      textColor: 'text-purple-600',
      badgeColor: 'bg-purple-50 text-purple-700'
    },
    'Surgeon': {
      svg: '🏥',
      bgColor: 'from-blue-100 to-cyan-100',
      textColor: 'text-blue-600',
      badgeColor: 'bg-blue-50 text-blue-700'
    },
    'Dermatologist': {
      svg: '🧴',
      bgColor: 'from-yellow-100 to-orange-100',
      textColor: 'text-yellow-600',
      badgeColor: 'bg-yellow-50 text-yellow-700'
    },
    'Psychiatrist': {
      svg: '🧠',
      bgColor: 'from-indigo-100 to-purple-100',
      textColor: 'text-indigo-600',
      badgeColor: 'bg-indigo-50 text-indigo-700'
    },
    'Orthopedist': {
      svg: '🦴',
      bgColor: 'from-amber-100 to-orange-100',
      textColor: 'text-amber-600',
      badgeColor: 'bg-amber-50 text-amber-700'
    },
    'Ophthalmologist': {
      svg: '👁️',
      bgColor: 'from-green-100 to-teal-100',
      textColor: 'text-green-600',
      badgeColor: 'bg-green-50 text-green-700'
    },
    'Gastroenterologist': {
      svg: '🍽️',
      bgColor: 'from-orange-100 to-red-100',
      textColor: 'text-orange-600',
      badgeColor: 'bg-orange-50 text-orange-700'
    },
    'Neurologist': {
      svg: '🧠',
      bgColor: 'from-violet-100 to-purple-100',
      textColor: 'text-violet-600',
      badgeColor: 'bg-violet-50 text-violet-700'
    },
    'ENT': {
      svg: '👂',
      bgColor: 'from-cyan-100 to-blue-100',
      textColor: 'text-cyan-600',
      badgeColor: 'bg-cyan-50 text-cyan-700'
    },
    'Pharmacist': {
      svg: '💊',
      bgColor: 'from-green-100 to-emerald-100',
      textColor: 'text-green-600',
      badgeColor: 'bg-green-50 text-green-700'
    },
    'Pulmonologist': {
      svg: '💨',
      bgColor: 'from-sky-100 to-blue-100',
      textColor: 'text-sky-600',
      badgeColor: 'bg-sky-50 text-sky-700'
    },
    'Radiologist': {
      svg: '🖼️',
      bgColor: 'from-slate-100 to-gray-100',
      textColor: 'text-slate-600',
      badgeColor: 'bg-slate-50 text-slate-700'
    },
    'Anesthesiologist': {
      svg: '💉',
      bgColor: 'from-lime-100 to-green-100',
      textColor: 'text-lime-600',
      badgeColor: 'bg-lime-50 text-lime-700'
    },
    'Infectious Disease Specialist': {
      svg: '🦠',
      bgColor: 'from-red-100 to-orange-100',
      textColor: 'text-red-600',
      badgeColor: 'bg-red-50 text-red-700'
    },
    'Urologist': {
      svg: '💧',
      bgColor: 'from-blue-100 to-cyan-100',
      textColor: 'text-blue-600',
      badgeColor: 'bg-blue-50 text-blue-700'
    },
    'Rheumatologist': {
      svg: '🦵',
      bgColor: 'from-orange-100 to-amber-100',
      textColor: 'text-orange-600',
      badgeColor: 'bg-orange-50 text-orange-700'
    },
    'Hematologist': {
      svg: '🩸',
      bgColor: 'from-rose-100 to-red-100',
      textColor: 'text-rose-600',
      badgeColor: 'bg-rose-50 text-rose-700'
    },
    'General Practitioner': {
      svg: '⚕️',
      bgColor: 'from-teal-100 to-cyan-100',
      textColor: 'text-teal-600',
      badgeColor: 'bg-teal-50 text-teal-700'
    }
  };

  // Find matching specialty
  for (const [key, value] of Object.entries(iconMap)) {
    if (specialty && specialty.includes(key)) {
      return value;
    }
  }

  // Default icon
  return {
    svg: '⚕️',
    bgColor: 'from-teal-100 to-cyan-100',
    textColor: 'text-teal-600',
    badgeColor: 'bg-teal-50 text-teal-700'
  };
};

// Get icon for different card types
export const getSpecialtyIcon = (specialty) => {
  const icons = getMedicalIcon(specialty);
  return icons.svg;
};

// Get background color gradient for specialty
export const getSpecialtyBgColor = (specialty) => {
  const icons = getMedicalIcon(specialty);
  return icons.bgColor;
};

// Get text color for specialty
export const getSpecialtyTextColor = (specialty) => {
  const icons = getMedicalIcon(specialty);
  return icons.textColor;
};

// Get badge color for specialty
export const getSpecialtyBadgeColor = (specialty) => {
  const icons = getMedicalIcon(specialty);
  return icons.badgeColor;
};
