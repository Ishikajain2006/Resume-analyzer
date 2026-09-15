export const metadata = {
  title: "Terms of Service | Resume Analyser",
  description: "Terms of service for Resume Analyser",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#090510] text-white py-24 sm:py-32 px-4 sm:px-6 relative z-10" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-white">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none text-white/70 space-y-6 text-sm sm:text-base leading-relaxed">
          <p className="text-sm text-white/50">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#d8b4fe] mt-6 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Resume Analyser, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#d8b4fe] mt-6 mb-3">2. Resume Analysis & Insights</h2>
            <p>
              Resume Analyser provides compatibility scores, keyword match insights, and interview simulations.
              <strong> Feedback and suggestions are for informational and preparation purposes only. </strong>
              They do not guarantee interview invites or employment offers.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#d8b4fe] mt-6 mb-3">3. Local Data & Privacy</h2>
            <p>
              Resume Analyser keeps your resume records secure on your local device. You retain full ownership and responsibility for maintaining backups of your files.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#d8b4fe] mt-6 mb-3">4. Acceptable Use</h2>
            <p>
              You agree to use Resume Analyser strictly for legitimate professional and career preparation purposes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
