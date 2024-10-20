import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { School } from './types';
import { updateCandidates, getSchoolsData, listenToSchoolsData } from './firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  const [loggedInSchool, setLoggedInSchool] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('App component mounted');
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User is signed in:', user.email);
        fetchInitialData();
      } else {
        console.log('User is signed out');
        setLoggedInSchool(null);
        setSchools([]);
        setIsLoading(false);
      }
    });

    const fetchInitialData = async () => {
      try {
        const initialSchools = await getSchoolsData();
        console.log('Initial schools data:', initialSchools);
        setSchools(initialSchools);
        setError(null);
      } catch (error) {
        console.error('Error fetching initial schools data:', error);
        setError('Veri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        toast.error('Veri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };

    console.log('Setting up listener for schools data');
    const unsubscribeSchools = listenToSchoolsData((updatedSchools, error) => {
      if (error) {
        console.error('Error in schools data listener:', error);
        setError('Veri güncellenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        toast.error('Veri güncellenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      } else if (updatedSchools) {
        console.log('Schools updated:', updatedSchools);
        setSchools(updatedSchools);
        setLoggedInSchool((prevLoggedInSchool) => {
          if (prevLoggedInSchool) {
            const updatedLoggedInSchool = updatedSchools.find(s => s.id === prevLoggedInSchool.id);
            return updatedLoggedInSchool || prevLoggedInSchool;
          }
          return null;
        });
        setError(null);
      }
    });

    return () => {
      console.log('Cleaning up listeners');
      unsubscribeAuth();
      if (typeof unsubscribeSchools === 'function') {
        unsubscribeSchools();
      }
    };
  }, []);

  const handleLogin = (school: School) => {
    console.log('Logging in school:', school);
    setLoggedInSchool(school);
  };

  const handleLogout = () => {
    console.log('Logging out');
    auth.signOut();
    setLoggedInSchool(null);
  };

  const handleUpdateCandidates = (schoolId: string, updatedCandidates: School['candidates']) => {
    console.log('Updating candidates:', schoolId, updatedCandidates);
    updateCandidates(schoolId, updatedCandidates).catch(error => {
      console.error('Error updating candidates:', error);
      setError('Aday sayısı güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
      toast.error('Aday sayısı güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    });
  };

  console.log('App render - loggedInSchool:', loggedInSchool, 'schools:', schools, 'isLoading:', isLoading, 'error:', error);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Yeniden Dene
        </button>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="App">
      {loggedInSchool ? (
        <Dashboard
          school={loggedInSchool}
          onLogout={handleLogout}
          schools={schools}
          updateCandidates={handleUpdateCandidates}
        />
      ) : (
        <Login schools={schools} onLogin={handleLogin} />
      )}
      <ToastContainer />
    </div>
  );
};

export default App;