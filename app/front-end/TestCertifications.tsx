import React from 'react';
import CertificationsSection from './components/layout/Sections/Certifications/CertificationsSection';

function App() {
  return (
    <div className="App">
      <CertificationsSection isAdminMode={true} showAdminFAB={true} />
    </div>
  );
}

export default App;
