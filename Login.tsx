import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogoIcon, BookOpenIcon } from './Icons';

const AuthScreen: React.FC = () => {
  const [accessKey, setAccessKey] = useState('');
  const { login, error: authError, loading } = useAuth();
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!accessKey) {
      setFormError('Please enter your Redeem Code.');
      return;
    }
    await login(accessKey);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-neumorphic-bg">
      <div className="w-full max-w-sm p-8 space-y-6 bg-neumorphic-bg rounded-2xl shadow-neumorphic-outset">
        <div className="flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-neumorphic-bg rounded-full shadow-neumorphic-outset">
              <LogoIcon className="w-10 h-10 text-neumorphic-text" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-700">
                鉄骨製作管理技術者 試験対策
            </h1>
            <p className="mt-2 text-sm text-slate-500">
                Enter your Redeem Code to continue
            </p>
        </div>

        <div className="my-6 p-4 bg-neumorphic-bg rounded-lg shadow-neumorphic-inset text-center">
            <BookOpenIcon className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-500">
                ဤ App သည် ဂျပန်နိုင်ငံ၏ 鉄骨製作管理技術者 (Steel Frame Production Management Engineer) စာမေးပွဲအတွက် လေ့လာနေသူများအတွက် ရည်ရွယ်ပါသည်။ စာမေးပွဲမေးခွန်းဟောင်းများနှင့် ၎င်းတို့၏ ရှင်းလင်းချက်များ၊ သက်ဆိုင်ရာ ဝေါဟာရများကို စုစည်းပေးထားပါသည်။
            </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="redeem-code" className="block text-sm font-medium text-gray-700 sr-only">
              Redeem Code
            </label>
            <div className="mt-1">
              <input
                id="redeem-code"
                name="redeem-code"
                type="text"
                autoComplete="off"
                required
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="block w-full px-4 py-3 bg-neumorphic-bg placeholder-slate-500 rounded-lg shadow-neumorphic-inset appearance-none border-2 border-transparent focus:outline-none focus:ring-0 sm:text-sm text-neumorphic-text"
                placeholder="Insert Redeem Code"
              />
            </div>
          </div>
          
          {(formError || authError) && <p className="text-sm text-center text-red-500">{formError || authError}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center w-full px-4 py-3 text-sm font-semibold text-neumorphic-text bg-neumorphic-bg rounded-lg shadow-neumorphic-outset hover:shadow-neumorphic-outset active:shadow-neumorphic-inset transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Unlock'}
            </button>
          </div>
        </form>
        
        <div className="pt-6 text-center text-sm">
          <p className="font-semibold text-slate-600">MYO KO KO OO</p>
          <a
            href="https://www.facebook.com/share/1EiUt29WW2/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block font-medium text-slate-500 hover:text-slate-700"
          >
            ဆက်သွယ်ရန် Account
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;