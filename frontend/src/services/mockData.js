export const initialAccounts = [
  {
    id: 'acc-gdrive-1',
    name: 'Google Drive',
    type: 'google_drive',
    label: 'Personal',
    accountEmail: 'tarun.personal@gmail.com',
    totalStorage: 15 * 1024 * 1024 * 1024, // 15 GB
    usedStorage: 8.2 * 1024 * 1024 * 1024, // 8.2 GB
    status: 'Active',
    lastSynced: '4m ago',
    color: '#4285F4',
    syncTelemetry: '42ms latency'
  },
  {
    id: 'acc-gdrive-2',
    name: 'Google Drive',
    type: 'google_drive',
    label: 'Acme Work',
    accountEmail: 'tarun.k@acmelabs.io',
    totalStorage: 15 * 1024 * 1024 * 1024, // 15 GB
    usedStorage: 4.9 * 1024 * 1024 * 1024, // 4.9 GB
    status: 'Active',
    lastSynced: '12m ago',
    color: '#34A853',
    syncTelemetry: '38ms latency'
  },
  {
    id: 'acc-onedrive',
    name: 'OneDrive',
    type: 'onedrive',
    label: 'Personal',
    accountEmail: 'tarun.k@outlook.com',
    totalStorage: 5 * 1024 * 1024 * 1024, // 5 GB
    usedStorage: 3.1 * 1024 * 1024 * 1024, // 3.1 GB
    status: 'Active',
    lastSynced: '18m ago',
    color: '#0078D4',
    syncTelemetry: '54ms latency'
  },
  {
    id: 'acc-dropbox',
    name: 'Dropbox',
    type: 'dropbox',
    label: 'Vault Archive',
    accountEmail: 'tarun.cloud@dropbox.com',
    totalStorage: 2 * 1024 * 1024 * 1024, // 2 GB
    usedStorage: 1.2 * 1024 * 1024 * 1024, // 1.2 GB
    status: 'Active',
    lastSynced: '2m ago',
    color: '#0061FF',
    syncTelemetry: '31ms latency'
  }
];

export const initialCategories = {
  photos: { name: 'Photos', count: 1420, size: 6.8 * 1024 * 1024 * 1024, icon: 'image', color: 'text-primary' },
  videos: { name: 'Videos', count: 84, size: 7.1 * 1024 * 1024 * 1024, icon: 'movie', color: 'text-secondary' },
  documents: { name: 'Documents', count: 312, size: 2.4 * 1024 * 1024 * 1024, icon: 'description', color: 'text-primary-container' },
  other: { name: 'Other / Archives', count: 58, size: 1.1 * 1024 * 1024 * 1024, icon: 'folder_zip', color: 'text-tertiary' }
};

export const initialFiles = [
  {
    id: 'folder-1',
    name: 'Design Assets',
    isFolder: true,
    itemCount: 14,
    provider: 'Google Drive #1',
    providerAccount: 'tarun.personal@gmail.com',
    providerType: 'google_drive',
    modifiedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    createdAt: '2024-06-15T08:30:00Z',
    isFavorite: true,
    syncStatus: 'synced',
    category: 'other'
  },
  {
    id: 'folder-2',
    name: 'Legal & Contracts',
    isFolder: true,
    itemCount: 8,
    provider: 'OneDrive',
    providerAccount: 'tarun.k@outlook.com',
    providerType: 'onedrive',
    modifiedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    createdAt: '2024-05-10T14:15:00Z',
    isFavorite: false,
    syncStatus: 'synced',
    category: 'other'
  },
  {
    id: 'folder-3',
    name: 'Quarterly Reports',
    isFolder: true,
    itemCount: 12,
    provider: 'Google Drive #2',
    providerAccount: 'tarun.k@acmelabs.io',
    providerType: 'google_drive',
    modifiedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    createdAt: '2024-04-01T10:00:00Z',
    isFavorite: false,
    syncStatus: 'synced',
    category: 'other'
  },
  {
    id: 'file-1',
    name: 'vacation-lake-tahoe.jpg',
    isFolder: false,
    type: 'Image',
    mimeType: 'image/jpeg',
    size: 4.2 * 1024 * 1024,
    category: 'photos',
    provider: 'Google Drive #1',
    providerAccount: 'tarun.personal@gmail.com',
    providerType: 'google_drive',
    modifiedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    createdAt: '2024-09-06T14:14:00Z',
    isFavorite: true,
    syncStatus: 'synced',
    previewUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    exif: {
      camera: 'Sony ILCE-7RM4',
      lens: 'FE 24-70mm F2.8 GM',
      iso: '100',
      shutter: '1/320s',
      aperture: 'f/4.0',
      dimensions: '3840 x 2160'
    },
    checksum: 'c28a994ef01824b26715fbc99014ba76'
  },
  {
    id: 'file-2',
    name: 'cloudvault-technical-spec-v1.pdf',
    isFolder: false,
    type: 'PDF Document',
    mimeType: 'application/pdf',
    size: 4.2 * 1024 * 1024,
    category: 'documents',
    provider: 'Dropbox',
    providerAccount: 'tarun.cloud@dropbox.com',
    providerType: 'dropbox',
    modifiedAt: '2024-09-04T15:12:00Z',
    createdAt: '2024-09-01T09:14:00Z',
    isFavorite: true,
    syncStatus: 'synced',
    versionTag: 'v1.4',
    pagesCount: 28,
    author: 'Tarun K.',
    checksum: 'e4d909c290d0fb1ca068ffaddf22cbd0',
    previewThumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'file-3',
    name: 'revenue-projections-2025.xlsx',
    isFolder: false,
    type: 'Spreadsheet',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 1.8 * 1024 * 1024,
    category: 'documents',
    provider: 'Google Drive #2',
    providerAccount: 'tarun.k@acmelabs.io',
    providerType: 'google_drive',
    modifiedAt: '2024-09-02T11:45:00Z',
    createdAt: '2024-08-28T16:20:00Z',
    isFavorite: false,
    syncStatus: 'synced',
    tag: 'Finance',
    author: 'Tarun K.',
    checksum: 'a91d227f4c0199ba34c67eb012a9de12'
  },
  {
    id: 'file-4',
    name: 'product-demo-walkthrough.mp4',
    isFolder: false,
    type: 'MP4 Video',
    mimeType: 'video/mp4',
    size: 480 * 1024 * 1024,
    category: 'videos',
    provider: 'Google Drive #1',
    providerAccount: 'tarun.personal@gmail.com',
    providerType: 'google_drive',
    modifiedAt: '2024-08-30T17:30:00Z',
    createdAt: '2024-08-30T12:00:00Z',
    isFavorite: true,
    syncStatus: 'synced',
    duration: '04:32',
    badge: '4K 60fps',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=600&q=80',
    checksum: 'bb88390c54a91924d081fe7842efbb01'
  },
  {
    id: 'file-5',
    name: 'backup-configs-september.tar.gz',
    isFolder: false,
    type: 'GZ Archive',
    mimeType: 'application/gzip',
    size: 82 * 1024 * 1024,
    category: 'other',
    provider: 'Google Drive #2',
    providerAccount: 'tarun.k@acmelabs.io',
    providerType: 'google_drive',
    modifiedAt: '2024-08-28T09:10:00Z',
    createdAt: '2024-08-28T09:00:00Z',
    isFavorite: false,
    syncStatus: 'synced',
    checksum: '49aa21ff99401bca00129dc88711ef03'
  },
  {
    id: 'file-6',
    name: 'sprint-notes-august.md',
    isFolder: false,
    type: 'Markdown',
    mimeType: 'text/markdown',
    size: 18 * 1024,
    category: 'documents',
    provider: 'Dropbox',
    providerAccount: 'tarun.cloud@dropbox.com',
    providerType: 'dropbox',
    modifiedAt: '2024-08-25T14:50:00Z',
    createdAt: '2024-08-01T10:15:00Z',
    isFavorite: false,
    syncStatus: 'synced',
    checksum: '9901eefb338271a003dcba90124817a2',
    content: `# August Engineering Sprint Notes

## Objectives Achieved
* Built zero-trust federated cloud indexing engine.
* Integrated Google Drive and OneDrive sync webhooks.
* Developed desktop-optimized file inspector pane with instant EXIF parsing.
* Added client-side PDF document canvas presenter.

## Next Milestones
* Integrate Spring Boot backend endpoints.
* Finalize Spring Security OAuth2 PKCE token rotation.`
  },
  {
    id: 'file-7',
    name: 'mountain-summit-sunrise.jpg',
    isFolder: false,
    type: 'Image',
    mimeType: 'image/jpeg',
    size: 5.8 * 1024 * 1024,
    category: 'photos',
    provider: 'OneDrive',
    providerAccount: 'tarun.k@outlook.com',
    providerType: 'onedrive',
    modifiedAt: '2024-08-22T06:30:00Z',
    createdAt: '2024-08-22T06:15:00Z',
    isFavorite: true,
    syncStatus: 'synced',
    previewUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    exif: {
      camera: 'Sony ILCE-7RM4',
      lens: '16-35mm F2.8 GM',
      iso: '64',
      shutter: '1/500s',
      aperture: 'f/5.6',
      dimensions: '4000 x 2667'
    },
    checksum: '5a4d339180b1e427cf4210a44810be33'
  },
  {
    id: 'file-8',
    name: 'cloudvault-keynote-deck.pptx',
    isFolder: false,
    type: 'Presentation',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 24.5 * 1024 * 1024,
    category: 'documents',
    provider: 'Google Drive #1',
    providerAccount: 'tarun.personal@gmail.com',
    providerType: 'google_drive',
    modifiedAt: '2024-08-20T13:20:00Z',
    createdAt: '2024-08-15T09:00:00Z',
    isFavorite: false,
    syncStatus: 'synced',
    author: 'Tarun K.',
    checksum: 'f32a441b00918cf23490aa11234bde55'
  },
  {
    id: 'file-9',
    name: 'design-system-spec.png',
    isFolder: false,
    type: 'Image',
    mimeType: 'image/png',
    size: 3.1 * 1024 * 1024,
    category: 'photos',
    provider: 'Dropbox',
    providerAccount: 'tarun.cloud@dropbox.com',
    providerType: 'dropbox',
    modifiedAt: '2024-08-15T18:00:00Z',
    createdAt: '2024-08-15T17:45:00Z',
    isFavorite: true,
    syncStatus: 'synced',
    previewUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80',
    exif: {
      dimensions: '1920 x 1080',
      colorProfile: 'Display P3'
    },
    checksum: '11b42398fa90cc11004523bb889100fa'
  },
  {
    id: 'file-10',
    name: 'interview-user-feedback.mp4',
    isFolder: false,
    type: 'MP4 Video',
    mimeType: 'video/mp4',
    size: 320 * 1024 * 1024,
    category: 'videos',
    provider: 'OneDrive',
    providerAccount: 'tarun.k@outlook.com',
    providerType: 'onedrive',
    modifiedAt: '2024-08-10T16:15:00Z',
    createdAt: '2024-08-10T15:00:00Z',
    isFavorite: false,
    syncStatus: 'synced',
    duration: '12:18',
    badge: '1080p HD',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
    checksum: '7721a998b4109ca889201fba4190cbb1'
  },
  {
    id: 'file-11',
    name: 'firmware-sys-kernel.bin',
    isFolder: false,
    type: 'Binary File',
    mimeType: 'application/octet-stream',
    size: 34.2 * 1024 * 1024,
    category: 'other',
    provider: 'Dropbox',
    providerAccount: 'tarun.cloud@dropbox.com',
    providerType: 'dropbox',
    modifiedAt: '2024-07-19T08:00:00Z',
    createdAt: '2024-07-19T07:30:00Z',
    isFavorite: false,
    syncStatus: 'synced',
    checksum: '0019fa778842bc90014a00bc19eebb23'
  }
];
