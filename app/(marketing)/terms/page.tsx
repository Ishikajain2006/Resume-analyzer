export const metadata = {
  title: "Terms of Service | NemotronATS",
  description: "Terms of service for NemotronATS",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#090510] text-white py-32 px-6 relative z-10" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none text-white/70 space-y-6">
          <p className="text-lg">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-[#d8b4fe] mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using NemotronATS, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#d8b4fe] mt-8 mb-4">2. AI-Generated Content</h2>
            <p>
              NemotronATS utilizes NVIDIA NIM and advanced language models to provide resume scoring, gap analysis, and interview simulations.
              <strong> You acknowledge that AI-generated advice is for informational purposes only. </strong>
              The scores and feedback provided should not be considered professional career advice or a guarantee of employment. Always exercise your own judgment when applying for jobs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#d8b4fe] mt-8 mb-4">3. Local Data Responsibility</h2>
            <p>
              Because NemotronATS stores your parsed resume data and job descriptions locally on your device (in <code>.data/db.json</code>), you are solely responsible for the security and backup of that file.
              We are not liable for any data loss that occurs on your local machine.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#d8b4fe] mt-8 mb-4">4. Acceptable Use</h2>
            <p>
              You agree not to use the service to process sensitive, classified, or unlawful information. The service is intended for personal career development and resume optimization.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
