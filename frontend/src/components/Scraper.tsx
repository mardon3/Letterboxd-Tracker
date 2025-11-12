import { useState } from 'react';
import { ScrapeUserData } from '../../wailsjs/go/main/App';

export default function Scraper() {
  const [username, setUsername] = useState('');
  const [scraping, setScraping] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleScrape = async () => {
    if (!username.trim()) {
      setError('Please enter a Letterboxd username');
      return;
    }

    try {
      setScraping(true);
      setError('');
      setSuccess('');
      setProgress('Starting import...');

      await ScrapeUserData(username);

      setSuccess(`Successfully imported films from ${username}!`);
      setProgress('');
      setUsername('');
    } catch (err) {
      setError(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
      setProgress('');
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="px-8 py-12 max-w-3xl mx-auto">
      <div className="bg-[#2c3440] border border-[#456] rounded-lg p-8">
        <h2 className="text-3xl font-bold text-white mb-6">Import Your Letterboxd Data</h2>

        {/* Instructions */}
        <div className="bg-letterboxd-dark border-l-4 border-letterboxd-blue rounded p-6 mb-8">
          <p className="text-white mb-3">
            Enter your Letterboxd username to import your complete film collection.
          </p>
          <p className="text-letterboxd-light-gray text-sm italic">
            Note: This may take a while depending on your collection size. Already imported films will be skipped.
          </p>
        </div>

        {/* Input */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Your Letterboxd username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !scraping && handleScrape()}
            disabled={scraping}
            className="flex-1 px-6 py-4 bg-letterboxd-dark border-2 border-[#456] rounded-lg text-white placeholder-[#678] focus:border-letterboxd-orange focus:outline-none text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleScrape}
            disabled={scraping || !username.trim()}
            className="px-8 py-4 bg-letterboxd-orange hover:bg-[#ff9500] text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-letterboxd-orange"
          >
            {scraping ? 'Importing...' : 'Import'}
          </button>
        </div>

        {/* Loading State */}
        {scraping && (
          <div className="bg-letterboxd-dark rounded-lg p-8 text-center mb-8">
            <div className="inline-block w-12 h-12 border-4 border-[#456] border-t-letterboxd-orange rounded-full animate-spin mb-4"></div>
            <p className="text-white text-lg">{progress || 'Processing your collection...'}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border-l-4 border-red-500 text-red-200 p-5 rounded mb-8">
            <p className="font-semibold mb-1">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-900/20 border-l-4 border-letterboxd-green text-green-200 p-5 rounded mb-8">
            <p className="font-semibold mb-1">Success!</p>
            <p>{success}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-letterboxd-dark border-l-4 border-[#8b5cf6] rounded p-6">
          <h3 className="text-white font-semibold mb-3">How it works:</h3>
          <ul className="space-y-2 text-letterboxd-light-gray">
            <li className="flex items-start gap-3">
              <span className="text-letterboxd-green text-xl">✓</span>
              <span>We'll scrape your public Letterboxd profile</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-letterboxd-green text-xl">✓</span>
              <span>Extract all your rated films and detailed metadata</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-letterboxd-green text-xl">✓</span>
              <span>Store everything locally on your computer</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-letterboxd-green text-xl">✓</span>
              <span>No data is sent to external servers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-letterboxd-green text-xl">✓</span>
              <span>Already imported films are automatically skipped</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
