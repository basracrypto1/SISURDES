export function generateLetterNumber(counter: number) {
  const now = new Date();
  const year = now.getFullYear();
  const sequence = counter.toString().padStart(3, '0');
  return `${sequence}/TML/433.313.02/${year}`;
}

export function formatDateIndo(dateString: string) {
  if (!dateString) return "....................";
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return "....................";
  }

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function getTodayISODate() {
  return new Date().toISOString().split('T')[0];
}
