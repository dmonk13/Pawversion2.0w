import React, { useState } from 'react';
import { X, Key, Info, Copy, Check } from 'lucide-react';

interface GoogleOAuthConfigProps {
  onClose: () => void;
}

const GoogleOAuthConfig: React.FC<GoogleOAuthConfigProps> = ({ onClose }) => {
  const [googleClientId, setGoogleClientId] = useState(localStorage.getItem('google_client_id') || '');
  const [tempClientId, setTempClientId] = useState(localStorage.getItem('google_client_id') || '');
  const [originError, setOriginError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSaveConfig = () => {
    const cleanedId = tempClientId.trim();

    if (!cleanedId) {
      setOriginError('Please enter a Client ID');
      return;
    }

    if (!cleanedId.endsWith('.apps.googleusercontent.com')) {
      setOriginError("Invalid Client ID format. It should end with '.apps.googleusercontent.com'");
      return;
    }

    localStorage.setItem('google_client_id', cleanedId);
    setGoogleClientId(cleanedId);
    alert('Google OAuth configured! Please reload the page for changes to take effect.');
    onClose();
  };

  const handleCopyOrigin = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to remove your Google OAuth configuration?')) {
      localStorage.removeItem('google_client_id');
      setGoogleClientId('');
      setTempClientId('');
      alert('Google OAuth configuration removed. Please reload the page.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-6 animate-in zoom-in-95 duration-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">Google OAuth Setup</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure Google Sign-In for your app</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl space-y-2 border border-orange-100 dark:border-orange-500/20">
            <div className="flex items-start gap-2">
              <Key size={14} className="text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-orange-700 dark:text-orange-400 font-bold">Setup Steps</p>
                <ol className="text-[9px] text-orange-600 dark:text-orange-400/80 mt-1 space-y-0.5 list-decimal list-inside">
                  <li>Go to Google Cloud Console</li>
                  <li>Create OAuth 2.0 Client ID (Web application)</li>
                  <li>Enable "Google People API"</li>
                  <li>Add your origin to "Authorized JavaScript origins"</li>
                  <li>Copy the Client ID and paste below</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Google Client ID
            </label>
            <input
              type="text"
              value={tempClientId}
              onChange={(e) => {
                setTempClientId(e.target.value);
                setOriginError(null);
              }}
              placeholder="123456789-abc.apps.googleusercontent.com"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            {originError && (
              <p className="text-[10px] text-red-500 font-bold ml-1">{originError}</p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 space-y-3">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wide">
                  Your Origin URL
                </p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400/80 leading-relaxed mt-1">
                  Copy this URL and add it to "Authorized JavaScript origins" in Google Cloud Console
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-blue-400 tracking-widest ml-1">
                Add this to Google Console
              </label>
              <div className="flex gap-2">
                <div className="flex-1 p-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-blue-500/20 font-mono text-[10px] text-slate-600 dark:text-slate-300 break-all">
                  {window.location.origin}
                </div>
                <button
                  onClick={handleCopyOrigin}
                  className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                    copied
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600'
                      : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <div className="text-[9px] text-blue-600 dark:text-blue-400 bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg">
              <strong>Quick Link:</strong>{' '}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-800 dark:hover:text-blue-300"
              >
                Open Google Cloud Console
              </a>
            </div>
          </div>

          <button
            onClick={handleSaveConfig}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all"
          >
            Save Configuration
          </button>

          {googleClientId && (
            <button
              onClick={handleReset}
              className="w-full py-3 text-red-500 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              Reset / Remove Configuration
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthConfig;
