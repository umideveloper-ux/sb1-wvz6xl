import React, { useState, useMemo } from 'react';
import { School, LicenseClass, DifferenceClass, LICENSE_FEES, CLASS_NAMES } from '../types';
import Chat from './Chat';
import AdminAnnouncementsBoard from './AdminAnnouncementsBoard';
import { LogOut, Car, PlusCircle, ChevronDown, ChevronUp, Users, Calculator, MessageSquare, BarChart2, Megaphone } from 'lucide-react';
import DetailedReport from './DetailedReport';
import AnalyticsChart from './AnalyticsChart';
import { auth } from '../firebase';
import Footer from './Footer';

interface DashboardProps {
  school: School;
  onLogout: () => void;
  schools: School[];
  updateCandidates: (schoolId: string, updatedCandidates: School['candidates']) => void;
}

const ADMIN_EMAIL = 'admin@surucukursu.com';

const Dashboard: React.FC<DashboardProps> = ({ school, onLogout, schools, updateCandidates }) => {
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);

  const handleCandidateChange = (licenseClass: LicenseClass | DifferenceClass, change: number) => {
    const updatedCandidates = {
      ...school.candidates,
      [licenseClass]: Math.max(0, (school.candidates[licenseClass] || 0) + change)
    };
    updateCandidates(school.id, updatedCandidates);
  };

  const totalCandidates = useMemo(() => 
    Object.values(school.candidates).reduce((sum, count) => sum + count, 0),
    [school.candidates]
  );

  const totalFee = useMemo(() => 
    Object.entries(school.candidates).reduce((sum, [classType, count]) => 
      sum + count * LICENSE_FEES[classType as LicenseClass | DifferenceClass], 0
    ),
    [school.candidates]
  );

  const toggleChat = () => setShowChat(!showChat);
  const toggleAnnouncements = () => setShowAnnouncements(!showAnnouncements);

  const isAdmin = auth.currentUser?.email === ADMIN_EMAIL;

  if (!auth.currentUser) {
    return <div className="flex justify-center items-center h-screen">Lütfen giriş yapın.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">{school.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-indigo-600" />
              Kursiyer Ekleme Bölümü
              <button
                onClick={() => setShowCandidateForm(!showCandidateForm)}
                className="ml-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                {showCandidateForm ? 'Gizle' : 'Göster'}
              </button>
            </h3>
            {showCandidateForm && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Object.entries(CLASS_NAMES).map(([classType, className]) => (
                  <div key={classType} className="flex flex-col items-center bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 mb-2">{className}</span>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleCandidateChange(classType as LicenseClass | DifferenceClass, -1)}
                        className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center focus:outline-none hover:bg-red-600 transition-colors duration-200"
                      >
                        -
                      </button>
                      <span className="mx-2 text-lg font-semibold">{school.candidates[classType as LicenseClass | DifferenceClass] || 0}</span>
                      <button
                        onClick={() => handleCandidateChange(classType as LicenseClass | DifferenceClass, 1)}
                        className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center focus:outline-none hover:bg-green-600 transition-colors duration-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex flex-wrap justify-between items-center">
              <div className="w-full sm:w-auto mb-2 sm:mb-0">
                <p className="text-sm font-medium text-gray-500">Toplam Kursiyer Sayısı</p>
                <p className="text-2xl font-semibold text-indigo-600">{totalCandidates}</p>
              </div>
              <div className="w-full sm:w-auto">
                <p className="text-sm font-medium text-gray-500">Toplam Ücret</p>
                <p className="text-2xl font-semibold text-green-600">{totalFee.toLocaleString('tr-TR')} TL</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DetailedReport schools={schools} />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center mb-4">
              <BarChart2 className="h-5 w-5 mr-2 text-indigo-600" />
              Analitik Grafik
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="ml-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {showAnalytics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </h3>
            {showAnalytics && <AnalyticsChart school={school} />}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 sm:px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Sürücü Kursları İletişim Kanalı</h2>
            <button
              onClick={toggleChat}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              {showChat ? 'Sohbeti Gizle' : 'Sohbeti Göster'}
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Bu bölümde diğer sürücü kurslarıyla iletişim kurabilir, bilgi paylaşımında bulunabilir ve işbirliği yapabilirsiniz.
            </p>
            {showChat ? (
              <Chat currentSchool={school} schools={schools} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Sohbet penceresini açmak için yukarıdaki "Sohbeti Göster" düğmesine tıklayabilirsiniz.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 sm:px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Yönetici Duyuru Panosu</h2>
              <button
                onClick={toggleAnnouncements}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              >
                <Megaphone className="h-5 w-5 mr-2" />
                {showAnnouncements ? 'Duyuruları Gizle' : 'Duyuruları Göster'}
              </button>
            </div>
            <div className="p-4 sm:p-6">
              {showAnnouncements ? (
                <AdminAnnouncementsBoard />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Duyuru panosunu açmak için yukarıdaki "Duyuruları Göster" düğmesine tıklayabilirsiniz.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;