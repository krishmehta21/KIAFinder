export interface ColorClasses {
  bg: string;
  text: string;
  border: string;
  shadow: string;
}

/**
 * Returns color-coded Tailwind classes based on the Vayu Vajra route family.
 */
export function getRouteFamilyColor(routeId: string): ColorClasses {
  const cleanId = routeId.toUpperCase();
  if (cleanId.startsWith('KIA-4')) {
    // KIA-4, KIA-4A: Amber/Orange
    return {
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/35',
      shadow: 'shadow-amber-500/10',
    };
  } else if (cleanId.startsWith('KIA-5')) {
    // KIA-5, KIA-5D: Rose/Pink
    return {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/35',
      shadow: 'shadow-rose-500/10',
    };
  } else if (cleanId.startsWith('KIA-6')) {
    // KIA-6, KIA-6A: Sky/Light Blue
    return {
      bg: 'bg-sky-500/15',
      text: 'text-sky-400',
      border: 'border-sky-500/35',
      shadow: 'shadow-sky-500/10',
    };
  } else if (cleanId.startsWith('KIA-7')) {
    // KIA-7, KIA-7A: Violet/Purple
    return {
      bg: 'bg-violet-500/15',
      text: 'text-violet-400',
      border: 'border-violet-500/35',
      shadow: 'shadow-violet-500/10',
    };
  } else if (cleanId.startsWith('KIA-8')) {
    // KIA-8, KIA-8A, KIA-8C, etc: Green/Emerald
    return {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/35',
      shadow: 'shadow-emerald-500/10',
    };
  } else if (cleanId.startsWith('KIA-9')) {
    // KIA-9, KIA-9H: Yellow
    return {
      bg: 'bg-yellow-500/15',
      text: 'text-yellow-400',
      border: 'border-yellow-500/35',
      shadow: 'shadow-yellow-500/10',
    };
  } else if (cleanId.startsWith('KIA-10')) {
    // KIA-10: Indigo
    return {
      bg: 'bg-indigo-500/15',
      text: 'text-indigo-400',
      border: 'border-indigo-500/35',
      shadow: 'shadow-indigo-500/10',
    };
  } else if (cleanId.startsWith('KIA-14')) {
    // KIA-14, KIA-14A: Orange/Red
    return {
      bg: 'bg-orange-500/15',
      text: 'text-orange-400',
      border: 'border-orange-500/35',
      shadow: 'shadow-orange-500/10',
    };
  } else if (cleanId.startsWith('KIA-15')) {
    // KIA-15, KIA-15A: Teal/Cyan
    return {
      bg: 'bg-teal-500/15',
      text: 'text-teal-400',
      border: 'border-teal-500/35',
      shadow: 'shadow-teal-500/10',
    };
  } else {
    // Fallback: Fuchsia
    return {
      bg: 'bg-fuchsia-500/15',
      text: 'text-fuchsia-400',
      border: 'border-fuchsia-500/35',
      shadow: 'shadow-fuchsia-500/10',
    };
  }
}
