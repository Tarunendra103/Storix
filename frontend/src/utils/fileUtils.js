export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (isToday) {
    return `Today, ${timeStr}`;
  }
  if (isYesterday) {
    return `Yesterday, ${timeStr}`;
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  if (year === now.getFullYear()) {
    return `${month} ${day}, ${timeStr}`;
  }
  return `${month} ${day}, ${year}`;
}

export function getFileExtension(filename = '') {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

export function getFileCategory(filename = '', mimeType = '') {
  const ext = getFileExtension(filename);
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'heic'].includes(ext) || mimeType.startsWith('image/')) {
    return 'photos';
  }
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv'].includes(ext) || mimeType.startsWith('video/')) {
    return 'videos';
  }
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv', 'md'].includes(ext) ||
      mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('sheet') || mimeType.includes('presentation') || mimeType.startsWith('text/')) {
    return 'documents';
  }
  return 'other';
}

export function getCategoryStats(files = []) {
  const stats = {
    photos: { count: 0, size: 0 },
    videos: { count: 0, size: 0 },
    documents: { count: 0, size: 0 },
    other: { count: 0, size: 0 }
  };

  files.forEach((file) => {
    if (file.isFolder) return;
    const category = file.category || getFileCategory(file.name, file.mimeType);
    if (!stats[category]) return;
    stats[category].count += 1;
    stats[category].size += file.size || 0;
  });

  return stats;
}

export function getProviderBadge(provider = '') {
  const name = (provider || '').toLowerCase();
  if (name.includes('google') && name.includes('work')) {
    return { name: 'Google Drive #2', dotColor: '#34A853', bg: 'bg-[#34A853]' };
  }
  if (name.includes('google')) {
    return { name: 'Google Drive #1', dotColor: '#4285F4', bg: 'bg-[#4285F4]' };
  }
  if (name.includes('onedrive')) {
    return { name: 'OneDrive', dotColor: '#0078D4', bg: 'bg-[#0078D4]' };
  }
  if (name.includes('dropbox')) {
    return { name: 'Dropbox', dotColor: '#0061FF', bg: 'bg-[#0061FF]' };
  }
  return { name: provider || 'Cloud', dotColor: '#737686', bg: 'bg-[#737686]' };
}

export function getFileIconInfo(file) {
  if (!file) return { icon: 'draft', colorClass: 'text-outline', label: 'File' };

  if (file.isFolder) {
    return {
      icon: 'folder',
      colorClass: 'text-[#f59e0b]',
      fill: true,
      label: 'Folder'
    };
  }

  const ext = getFileExtension(file.name);
  const cat = file.category || getFileCategory(file.name, file.mimeType);

  switch (ext) {
    case 'pdf':
      return { icon: 'picture_as_pdf', colorClass: 'text-error', label: 'PDF Document' };
    case 'xlsx':
    case 'xls':
    case 'csv':
      return { icon: 'table_chart', colorClass: 'text-[#107c41]', label: 'Spreadsheet' };
    case 'docx':
    case 'doc':
      return { icon: 'article', colorClass: 'text-[#0053db]', label: 'Word Document' };
    case 'pptx':
    case 'ppt':
      return { icon: 'slideshow', colorClass: 'text-[#d83b01]', label: 'Presentation' };
    case 'zip':
    case 'tar':
    case 'gz':
    case 'rar':
    case '7z':
      return { icon: 'folder_zip', colorClass: 'text-tertiary-container', label: 'Archive' };
    case 'md':
      return { icon: 'markdown', colorClass: 'text-outline', label: 'Markdown' };
    case 'js':
    case 'jsx':
    case 'html':
    case 'css':
    case 'json':
    case 'ts':
      return { icon: 'code', colorClass: 'text-primary', label: 'Code' };
    default:
      if (cat === 'photos') return { icon: 'image', colorClass: 'text-primary', label: 'Image' };
      if (cat === 'videos') return { icon: 'movie', colorClass: 'text-secondary', label: 'Video' };
      if (cat === 'documents') return { icon: 'description', colorClass: 'text-on-surface-variant', label: 'Document' };
      return { icon: 'draft', colorClass: 'text-outline', label: 'File' };
  }
}
