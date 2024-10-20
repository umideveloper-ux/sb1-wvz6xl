import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white shadow-md mt-8">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500">
          © 2024 Sürücü Kursu Yönetim Sistemi. Tüm hakları saklıdır.
        </p>
        <p className="text-center text-xs text-gray-400 mt-1">
          Haşim Doğan Işık tarafından tasarlanmış ve kodlanmıştır.
        </p>
      </div>
    </footer>
  );
};

export default Footer;