export const getProjectCardColor = (projectId: any, risk?: 'high' | 'medium' | 'low') => {
  if (risk === 'high') return 'bg-gradient-to-br from-red-600 to-red-800 border-red-500';
  if (risk === 'medium') return 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-500';
  if (risk === 'low') return 'bg-gradient-to-br from-green-500 to-green-600 border-green-600';
  const colors = [
    'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500',
    'bg-gradient-to-br from-blue-500 to-cyan-600 border-blue-500',
    'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-500',
    'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-500',
    'bg-gradient-to-br from-rose-500 to-red-600 border-rose-500',
    'bg-gradient-to-br from-violet-500 to-purple-700 border-violet-500'
  ];
  const idx = typeof projectId === 'number' ? projectId : 0;
  return colors[idx % colors.length];
};
