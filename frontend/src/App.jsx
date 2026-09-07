import React from 'react';
import { VaultProvider, useVault } from './context/VaultContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Home } from './pages/Home';
import { MyFiles } from './pages/MyFiles';
import { Photos } from './pages/Photos';
import { Videos } from './pages/Videos';
import { Documents } from './pages/Documents';
import { Favorites } from './pages/Favorites';
import { StoragePage } from './pages/StoragePage';
import { ConnectedAccounts } from './pages/ConnectedAccounts';
import { Settings } from './pages/Settings';
import { FilePreviewModal } from './components/preview/FilePreviewModal';
import { UploadModal } from './components/upload/UploadModal';
import { ConnectAccountModal } from './components/modals/ConnectAccountModal';
import { NewFolderModal } from './components/modals/NewFolderModal';
import { RenameModal } from './components/modals/RenameModal';
import { ConfirmDeleteModal } from './components/modals/ConfirmDeleteModal';
import { ToastContainer } from './components/ui/Toast';

function AppContent() {
  const { activeNav } = useVault();

  const renderActivePage = () => {
    switch (activeNav) {
      case 'home':
        return <Home />;
      case 'my-files':
      case 'other':
      case 'recent':
        return <MyFiles />;
      case 'photos':
        return <Photos />;
      case 'videos':
        return <Videos />;
      case 'documents':
        return <Documents />;
      case 'favorites':
        return <Favorites />;
      case 'storage':
        return <StoragePage />;
      case 'connected-accounts':
        return <ConnectedAccounts />;
      case 'settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low font-body-md text-on-surface antialiased flex flex-col">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main App Content Area */}
      <div className="pl-0 md:pl-[230px] flex-1 flex flex-col min-w-0">
        {/* Persistent Top Header */}
        <Header />

        {/* Dynamic Page Viewport */}
        <main className="relative min-h-screen p-4 pt-[68px] sm:p-6 sm:pt-[76px] md:p-space-xl md:pt-[76px]">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Interactive Modals & Preview Systems */}
      <FilePreviewModal />
      <UploadModal />
      <ConnectAccountModal />
      <NewFolderModal />
      <RenameModal />
      <ConfirmDeleteModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <VaultProvider>
      <AppContent />
    </VaultProvider>
  );
}
