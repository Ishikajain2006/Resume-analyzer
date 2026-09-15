export const metadata = {
  title: "Privacy Policy | Resume Analyser",
  description: "Privacy policy for Resume Analyser",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#090510] text-white py-24 sm:py-32 px-4 sm:px-6 relative z-10" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-white">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none text-white/70 space-y-6 text-sm sm:text-base leading-relaxed">
          <p className="text-sm text-white/50">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#d8b4fe] mt-6 mb-3">1. Local & Private Data Storage</h2>
            <p>
              Resume Analyser is built with privacy at its core. When you upload a resume or job description, data is stored securely on your local device. We do not store or distribute your resume to third-party data brokers.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#d8b4fe] mt-6 mb-3">2. Analysis Processing</h2>
            <p>
              To generate match scores, missing keyword insights, and tailored interview questions, your input text is processed securely. Your data is strictly used to deliver your report and is never used to train public models without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#d8b4fe] mt-6 mb-3">3. Data Control & Deletion</h2>
            <p>
              You maintain total control over your resume history. You can remove any previously analyzed resumes at any time directly through the History tab in your dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#d8b4fe] mt-6 mb-3">4. Cookies & Authentication</h2>
            <p>
              We use minimal cookies strictly required for secure user session management. Resume Analyser does not track you across other websites.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
