import { useState } from 'react';
import { DeleteDatabase } from '../../wailsjs/go/main/App';

export default function Settings() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDeleteDatabase = async () => {
    try {
      setIsDeleting(true);
      setError('');
      setSuccess('');
      
      await DeleteDatabase();
      
      setSuccess('Database cleared successfully! You can now re-import your data.');
      setShowConfirm(false);
    } catch (err) {
      setError(`Failed to delete database: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="px-8 py-12 max-w-4xl mx-auto">
      <div className="bg-[#2c3440] border border-[#456] rounded-lg p-8">
        <h2 className="text-3xl font-bold text-white mb-8">Settings</h2>

        {/* Database Information */}
        <div className="mb-8 pb-8 border-b border-[#456]">
          <h3 className="text-xl font-semibold text-white mb-4">Database Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-letterboxd-light-gray text-sm uppercase tracking-wide mb-2">
                Database Location
              </label>
              <div className="bg-letterboxd-dark border border-[#456] rounded p-4 font-mono text-sm text-white">
                ~/Library/Application Support/LetterboxdTracker/letterboxd.db
              </div>
            </div>
            
            <div>
              <label className="block text-letterboxd-light-gray text-sm uppercase tracking-wide mb-2">
                Storage Type
              </label>
              <div className="bg-letterboxd-dark border border-[#456] rounded p-4 text-white">
                All data is stored locally on your computer
              </div>
            </div>
          </div>
        </div>

        {/* Database Management */}
        <div className="mb-8 pb-8 border-b border-[#456]">
          <h3 className="text-xl font-semibold text-white mb-4">Database Management</h3>
          
          <div className="bg-letterboxd-dark border-l-4 border-yellow-500 rounded p-6 mb-4">
            <p className="text-yellow-200 mb-3">
              <span className="font-semibold">Clear Database</span>
            </p>
            <p className="text-letterboxd-light-gray leading-relaxed mb-4">
              This will permanently delete all imported movies from your local database. 
              You'll need to re-import your data from Letterboxd to see your collection again.
            </p>
            <p className="text-[#678] text-sm italic">
              Use this if you want to refresh your data with updated ratings or if you need to start over.
            </p>
          </div>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Clear Database
            </button>
          ) : (
            <div className="bg-red-900/20 border-l-4 border-red-500 rounded p-6">
              <p className="text-red-200 font-semibold mb-4">
                Are you sure you want to delete all movies from the database?
              </p>
              <p className="text-red-300/80 mb-6">
                This action cannot be undone. All {/* you could show count here */} movies will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteDatabase}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setError('');
                  }}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-[#456] hover:bg-[#567] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-900/20 border-l-4 border-red-500 text-red-200 p-4 rounded">
              <p className="font-semibold mb-1">Error</p>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-900/20 border-l-4 border-letterboxd-green text-green-200 p-4 rounded">
              <p className="font-semibold mb-1">Success!</p>
              <p>{success}</p>
            </div>
          )}
        </div>

        {/* About Section */}
        <div className="mb-8 pb-8 border-b border-[#456]">
          <h3 className="text-xl font-semibold text-white mb-4">About</h3>
          
          <div className="space-y-4 text-letterboxd-light-gray leading-relaxed">
            <p>
              <span className="text-white font-semibold">Letterboxd Tracker</span> is a desktop 
              application that lets you import and analyze your Letterboxd film collection locally.
            </p>
            <p>
              Built with Wails (Go + React) and SQLite for offline-first film tracking with 
              complete privacy.
            </p>
            <p className="text-[#678] text-sm italic">Version 1.0.0</p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-8 pb-8 border-b border-[#456]">
          <h3 className="text-xl font-semibold text-white mb-4">Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-letterboxd-green text-xl shrink-0">✓</span>
              <span className="text-letterboxd-light-gray">Import complete Letterboxd viewing history</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-letterboxd-green text-xl shrink-0">✓</span>
              <span className="text-letterboxd-light-gray">View detailed statistics about watching habits</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-letterboxd-green text-xl shrink-0">✓</span>
              <span className="text-letterboxd-light-gray">Search and filter your film collection</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-letterboxd-green text-xl shrink-0">✓</span>
              <span className="text-letterboxd-light-gray">Track ratings, reviews, and metadata</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-letterboxd-green text-xl shrink-0">✓</span>
              <span className="text-letterboxd-light-gray">All data stored locally on your device</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-letterboxd-green text-xl shrink-0">✓</span>
              <span className="text-letterboxd-light-gray">Dark mode interface inspired by Letterboxd</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-linear-to-r from-red-900/30 to-red-900/20 border-l-4 border-red-500 rounded p-6">
          <h3 className="text-red-300 font-semibold mb-3">Disclaimer</h3>
          <p className="text-red-200/90 leading-relaxed">
            This application is not affiliated with, endorsed by, or connected to Letterboxd. 
            Please use responsibly and adhere to Letterboxd's rate limits.
          </p>
        </div>
      </div>
    </div>
  );
}