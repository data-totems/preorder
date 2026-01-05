 export function formatDateWithOrdinal(dateString: string) {
    const date = new Date(dateString);
    
    // Get day for ordinal suffix
    const day = date.getDate();
    const suffix = getOrdinalSuffix(day);
    
    // Format the date
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long' 
    };
    
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    
    return `${weekday} ${day}${suffix} ${month} ${year}`;
}

function getOrdinalSuffix(day: any) {
    if (day >= 11 && day <= 13) return 'th';
    
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}


export const formatTimestamp = (dateString: string) => {
  const date = new Date(dateString);
  
  // Get day, month, year
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  
  // Get hours and minutes
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  // Determine AM/PM
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  
  return `${day}/${month}/${year} ${hours}:${minutes}${ampm}`;
};