export default function Settings() {
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
