import React, { useState, useMemo, useEffect } from 'react';
import Card from './Card';
import KanjiTooltip from './KanjiTooltip';
import Dropdown from './Dropdown';
import { studyDataByChapter, chapterCount } from '../data/content';
import { kanjiDictionary } from '../data/kanji';
import { Kanji } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogoutIcon, LogoIcon, BookmarkIcon, SearchIcon, BookOpenIcon, PencilIcon, GlobeIcon, RefreshIcon, UsersIcon, TrashIcon, ClockIcon, ChevronLeftIcon, ListBulletIcon, CheckCircleSolidIcon, BellIcon } from './Icons';
import { useBookmarks } from '../hooks/useBookmarks';
import { VALID_ACCESS_KEYS } from '../data/keys';

interface HistoryEntry {
  deviceId: string;
  accessKey: string;
  timestamp: string;
  userAgent: string;
}

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { bookmarkedIds } = useBookmarks();
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeChapter, setActiveChapter] = useState(1);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const [studyAnswers, setStudyAnswers] = useState<{[key: string]: number}>({});

  const [activeKanji, setActiveKanji] = useState<Kanji | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  
  const [view, setView] = useState<'study' | 'list'>('study');

  // Admin View State
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [isAdminViewVisible, setIsAdminViewVisible] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [itemToDelete, setItemToDelete] = useState<{key: string; deviceId: string} | null>(null);
  const [devicesData, setDevicesData] = useState<{ [key: string]: string[] }>({});
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [adminTab, setAdminTab] = useState<'active' | 'history'>('active');


  // Constants for Admin View
  const DEFAULT_DEVICE_LIMIT = 1;
  const SPECIAL_ACCESS_KEY = 'BESTFRIEND';
  const SPECIAL_KEY_DEVICE_LIMIT = 10;
  const DEVICES_KEY = 'auth_devices_by_key';
  const DEVICE_HISTORY_KEY = 'auth_device_history';
  const ADMIN_PASSCODE = '454879';


  const loadDevicesData = () => {
    try {
      const devicesJSON = localStorage.getItem(DEVICES_KEY);
      setDevicesData(devicesJSON ? JSON.parse(devicesJSON) : {});
    } catch (e) {
      console.error("Failed to parse device data from localStorage", e);
      setDevicesData({});
    }
  };

  const loadHistoryData = () => {
    try {
      const historyJSON = localStorage.getItem(DEVICE_HISTORY_KEY);
      setHistoryData(historyJSON ? JSON.parse(historyJSON) : []);
    } catch (e) {
      console.error("Failed to parse history data from localStorage", e);
      setHistoryData([]);
    }
  };

  useEffect(() => {
    if (isAdminViewVisible) {
      loadDevicesData();
      loadHistoryData();
    }
  }, [isAdminViewVisible]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.toLowerCase() === 'mkkocheck') {
      setShowAdminLogin(true);
      setAdminPassword('');
      setAdminLoginError('');
      setSearchQuery(''); // Clear input field
    } else {
      if (isAdminViewVisible) setIsAdminViewVisible(false);
      setSearchQuery(value);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === ADMIN_PASSCODE) {
      setIsAdminViewVisible(true);
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      setAdminLoginError('Incorrect Passcode.');
    }
  };

  const handleDeleteRequest = (key: string, deviceId: string) => {
    setItemToDelete({ key, deviceId });
    setDeletePassword('');
    setDeleteError('');
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (deletePassword === ADMIN_PASSCODE && itemToDelete) {
      const currentDevices = JSON.parse(localStorage.getItem(DEVICES_KEY) || '{}');
      
      if (currentDevices[itemToDelete.key]) {
        currentDevices[itemToDelete.key] = currentDevices[itemToDelete.key].filter(
          (id: string) => id !== itemToDelete.deviceId
        );
        if (currentDevices[itemToDelete.key].length === 0) {
          delete currentDevices[itemToDelete.key];
        }
      }

      localStorage.setItem(DEVICES_KEY, JSON.stringify(currentDevices));
      loadDevicesData(); // Refresh view state

      // Close modal
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } else {
      setDeleteError('Incorrect Passcode.');
    }
  };


  const handleKanjiClick = (kanji: string, event: React.MouseEvent<HTMLSpanElement>) => {
    const kanjiData = kanjiDictionary[kanji];
    if (kanjiData) {
      const rect = event.currentTarget.getBoundingClientRect();
      setActiveKanji(kanjiData);
      setTooltipPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  };

  const handleCloseTooltip = () => {
    setActiveKanji(null);
  };

  const currentChapterData = useMemo(() => studyDataByChapter[activeChapter] || [], [activeChapter]);

  const filteredData = useMemo(() => {
    let data = currentChapterData;

    if (showOnlyBookmarked) {
      data = data.filter(item => bookmarkedIds.has(item.id));
    }

    if (searchQuery.trim() !== '') {
      const lowercasedQuery = searchQuery.toLowerCase().trim();
      data = data.filter(item => {
        const inQuestionJP = item.questionJP.toLowerCase().includes(lowercasedQuery);
        const inQuestionMY = item.questionMY.toLowerCase().includes(lowercasedQuery);
        const inOptions = item.options.some(opt => 
          opt.textMY.toLowerCase().includes(lowercasedQuery) ||
          opt.textJP.toLowerCase().includes(lowercasedQuery)
        );
        return inQuestionJP || inQuestionMY || inOptions;
      });
    }

    return data;
  }, [currentChapterData, showOnlyBookmarked, bookmarkedIds, searchQuery]);

  // Reset states when filters or chapter change
  useEffect(() => {
    setCurrentCardIndex(0);
    setStudyAnswers({});
    setView('study'); // Go back to study view when chapter changes
  }, [activeChapter, showOnlyBookmarked, searchQuery]);

  const goToNextCard = () => {
    setCurrentCardIndex(prev => Math.min(prev + 1, filteredData.length - 1));
  };
  
  const goToPreviousCard = () => {
    setCurrentCardIndex(prev => Math.max(prev - 1, 0));
  };
  
  const handleChapterChange = (chapter: number) => {
    setActiveChapter(chapter);
  }

  const handleQuestionSelect = (index: number) => {
    setCurrentCardIndex(index);
    setView('study');
  };
  
  const handleOptionSelect = (cardId: string, optionId: number) => {
    if (studyAnswers[cardId] !== undefined) return; // Already answered
    setStudyAnswers(prev => ({...prev, [cardId]: optionId}));
  };

  const currentCard = filteredData[currentCardIndex];
  
  const chapterOptions = Array.from({ length: chapterCount }, (_, i) => ({
    value: i + 1,
    label: `Chapter ${i + 1}`,
  }));

  const answeredIDsInFilter = useMemo(() => {
    const filteredIds = new Set(filteredData.map(c => c.id));
    return Object.keys(studyAnswers).filter(answeredId => filteredIds.has(answeredId));
  }, [studyAnswers, filteredData]);
  
  const answeredCount = answeredIDsInFilter.length;

  const correctCount = useMemo(() => {
    return answeredIDsInFilter.reduce((count, cardId) => {
      const card = filteredData.find(c => c.id === cardId);
      if (card && studyAnswers[cardId] === card.correctOptionId) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [studyAnswers, filteredData, answeredIDsInFilter]);

  const renderContent = () => {
    if (isAdminViewVisible) {
      // Admin view remains dark-themed for distinction
      return (
         <div className="space-y-4 p-4 rounded-xl shadow-neumorphic-inset bg-slate-800">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                    <UsersIcon className="w-8 h-8 text-blue-400" />
                    Admin Panel
                </h2>
            </div>
            {/* Tabs and content for admin panel... */}
        </div>
      );
    }
    
    if (view === 'list') {
        return (
            <div className="bg-neumorphic-bg rounded-2xl shadow-neumorphic-inset p-2 sm:p-4">
                <div className="p-4 border-b border-neumorphic-shadow-dark/20">
                    <h2 className="text-lg font-semibold text-neumorphic-text">Question Bank - Chapter {activeChapter}</h2>
                </div>
                <ul className="divide-y divide-neumorphic-shadow-dark/20 max-h-[70vh] overflow-y-auto">
                    {filteredData.map((card, index) => {
                        const isAnswered = studyAnswers[card.id] !== undefined;
                        const isCorrect = isAnswered && studyAnswers[card.id] === card.correctOptionId;
                        return (
                             <li key={card.id}>
                                <button onClick={() => handleQuestionSelect(index)} className="w-full text-left p-4 hover:bg-neumorphic-bg hover:shadow-neumorphic-inset active:shadow-neumorphic-inset transition-all duration-200 flex items-start justify-between gap-4 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-600">Question {card.id}</p>
                                        <p className="text-sm text-slate-500">
                                            {language === 'my' ? card.questionMY : card.questionJP.replace(/<[^>]+>/g, '')}
                                        </p>
                                    </div>
                                    {isAnswered && (
                                        <CheckCircleSolidIcon className={`w-6 h-6 shrink-0 mt-0.5 ${isCorrect ? 'text-green-500' : 'text-red-500'}`} />
                                    )}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }

    if (filteredData.length === 0) {
      return (
        <div className="text-center py-16 px-6 bg-neumorphic-bg rounded-2xl shadow-neumorphic-outset">
          {searchQuery ? (
            <>
              <SearchIcon className="w-12 h-12 mx-auto text-slate-400" />
              <h3 className="mt-2 text-lg font-semibold text-slate-600">No Results Found</h3>
              <p className="mt-1 text-sm text-slate-500">
                Your search for "{searchQuery}" did not match any questions in this chapter.
              </p>
            </>
          ) : showOnlyBookmarked ? (
            <>
              <BookmarkIcon className="w-12 h-12 mx-auto text-slate-400" />
              <h3 className="mt-2 text-lg font-semibold text-slate-600">No Bookmarked Questions</h3>
              <p className="mt-1 text-sm text-slate-500">
                No bookmarked questions found in this chapter.
              </p>
            </>
          ) : (
             <>
              <PencilIcon className="w-12 h-12 mx-auto text-slate-400" />
              <h3 className="mt-2 text-lg font-semibold text-slate-600">No Questions Available</h3>
              <p className="mt-1 text-sm text-slate-500">
                  There are no questions in this chapter yet.
              </p>
            </>
          )}
        </div>
      );
    }

    return (
      <div>
        <p className="text-center mb-4 text-sm text-slate-500">
          Showing question <span className="font-semibold text-slate-700">{currentCardIndex + 1}</span> of <span className="font-semibold text-slate-700">{filteredData.length}</span>
        </p>

        <Card 
          key={currentCard.id} 
          data={currentCard}
          onKanjiClick={handleKanjiClick}
          mode="study"
          onOptionSelect={(optionId) => handleOptionSelect(currentCard.id, optionId)}
          selectedOptionId={studyAnswers[currentCard.id]}
          isSubmitted={studyAnswers[currentCard.id] !== undefined}
        />
        
        <div className="flex items-center justify-between mt-6 gap-4">
          <button 
              onClick={goToPreviousCard}
              disabled={currentCardIndex === 0}
              className="w-full px-6 py-2.5 text-sm font-semibold text-neumorphic-text bg-neumorphic-bg rounded-lg shadow-neumorphic-outset hover:shadow-neumorphic-outset active:shadow-neumorphic-inset transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button 
              onClick={goToNextCard}
              disabled={currentCardIndex === filteredData.length - 1}
              className="w-full px-6 py-2.5 text-sm font-semibold text-neumorphic-text bg-neumorphic-bg rounded-lg shadow-neumorphic-outset hover:shadow-neumorphic-outset active:shadow-neumorphic-inset transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-neumorphic-bg">
       {showAdminLogin && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm p-8 space-y-6 bg-slate-900 rounded-xl shadow-xl ring-1 ring-white/10">
            {/* Admin Login remains dark themed */}
            <h2 className="text-xl font-bold text-center text-slate-100">Admin Access</h2>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="block w-full px-4 py-3 bg-slate-800 placeholder-gray-400 border border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-slate-100" placeholder="Enter Passcode" autoComplete="off" autoFocus />
              {adminLoginError && <p className="text-sm text-center text-red-400">{adminLoginError}</p>}
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowAdminLogin(false)} className="w-full px-4 py-2 text-sm font-semibold bg-slate-600 text-slate-200 rounded-lg hover:bg-slate-500 transition-colors">Cancel</button>
                <button type="submit" className="w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Login</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          {/* Admin modal remains dark themed */}
        </div>
      )}

      <KanjiTooltip 
        kanjiData={activeKanji}
        position={tooltipPosition}
        onClose={handleCloseTooltip}
      />
      <header className="sticky top-0 z-20 w-full bg-neumorphic-bg">
        <div className="flex items-center justify-between h-16 max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full shadow-neumorphic-outset">
                <LogoIcon className="w-6 h-6 text-neumorphic-text" />
              </div>
              <h1 className="text-xl font-bold text-slate-700 hidden sm:block">
                鉄骨技術者 試験対策
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-32 sm:w-48 pl-10 pr-3 py-2 text-sm bg-neumorphic-bg text-neumorphic-text placeholder-slate-500 rounded-lg shadow-neumorphic-inset border-2 border-transparent focus:outline-none focus:ring-0 transition-all"
                    />
                </div>
                 <button
                    onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
                    className={`p-2.5 rounded-lg transition-all duration-200 ${
                    showOnlyBookmarked
                        ? 'shadow-neumorphic-inset text-slate-700'
                        : 'shadow-neumorphic-outset text-slate-500 hover:text-slate-700'
                    }`}
                    aria-pressed={showOnlyBookmarked}
                    title="Toggle Bookmarked"
                >
                    <BookmarkIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={toggleLanguage}
                    className="p-2.5 rounded-lg shadow-neumorphic-outset text-slate-500 hover:text-slate-700 active:shadow-neumorphic-inset transition-all duration-200"
                    title="Toggle Language"
                >
                    <GlobeIcon className="w-5 h-5" />
                </button>
                <button
                onClick={logout}
                className="p-2.5 rounded-lg shadow-neumorphic-outset text-slate-500 hover:text-red-500 active:shadow-neumorphic-inset transition-all duration-200"
                title="Logout"
                >
                    <LogoutIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      </header>
      <main className="max-w-4xl p-4 mx-auto sm:p-6 lg:p-8">
        
       {!isAdminViewVisible && (
        <>
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 mb-6 bg-neumorphic-bg rounded-xl shadow-neumorphic-outset gap-4">
                <div className="w-full sm:w-1/2">
                    <Dropdown
                        options={chapterOptions}
                        value={activeChapter}
                        onChange={(val) => handleChapterChange(Number(val))}
                        ariaLabel="Select Chapter"
                    />
                </div>
                 <button
                    onClick={() => setView(view === 'study' ? 'list' : 'study')}
                    className="relative flex items-center justify-center w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-neumorphic-text bg-neumorphic-bg rounded-lg shadow-neumorphic-outset hover:shadow-neumorphic-outset active:shadow-neumorphic-inset transition-all"
                >
                    {view === 'study' ? <ListBulletIcon className="w-5 h-5 mr-2"/> : <ChevronLeftIcon className="w-5 h-5 mr-2"/>}
                    {view === 'study' ? 'Question Bank' : 'Back to Study'}
                    <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 text-xs font-bold text-slate-600 bg-neumorphic-bg rounded-full shadow-neumorphic-outset">{filteredData.length}</span>
                </button>
            </div>

            {view === 'study' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-neumorphic-bg p-4 rounded-xl shadow-neumorphic-outset flex items-center justify-between">
                      <div>
                          <p className="text-sm text-slate-500">Total</p>
                          <p className="text-2xl font-bold text-slate-700">{filteredData.length}</p>
                      </div>
                      <div className="p-3 rounded-full shadow-neumorphic-inset">
                          <BookOpenIcon className="w-6 h-6 text-slate-600"/>
                      </div>
                  </div>
                  <div className="bg-neumorphic-bg p-4 rounded-xl shadow-neumorphic-outset flex items-center justify-between">
                      <div>
                          <p className="text-sm text-slate-500">Answered</p>
                          <p className="text-2xl font-bold text-slate-700">{answeredCount}</p>
                      </div>
                       <div className="p-3 rounded-full shadow-neumorphic-inset">
                          <PencilIcon className="w-6 h-6 text-slate-600"/>
                      </div>
                  </div>
                  <div className="bg-neumorphic-bg p-4 rounded-xl shadow-neumorphic-outset flex items-center justify-between">
                      <div>
                          <p className="text-sm text-slate-500">Correct</p>
                          <p className="text-2xl font-bold text-slate-700">{correctCount}</p>
                      </div>
                       <div className="p-3 rounded-full shadow-neumorphic-inset">
                          <CheckCircleSolidIcon className="w-6 h-6 text-slate-600"/>
                      </div>
                  </div>
              </div>
            )}
        </>
       )}

        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;