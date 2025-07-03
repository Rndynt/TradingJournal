export function detectSession(): string {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 21 || hour < 6) {
    return "asia";
  } else if (hour >= 6 && hour < 14) {
    return "london";
  } else {
    return "newyork";
  }
}

export function getSessionLabel(session: string): string {
  switch (session) {
    case "asia":
      return "Asia Session";
    case "london":
      return "London Session";
    case "newyork":
      return "New York Session";
    default:
      return "Unknown Session";
  }
}

export function getSessionColor(session: string): string {
  switch (session) {
    case "asia":
      return "text-blue-400";
    case "london":
      return "text-yellow-400";
    case "newyork":
      return "text-green-400";
    default:
      return "text-gray-400";
  }
}
