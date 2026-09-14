export const metadata = {
  title: "Privacy Policy | NemotronATS",
  description: "Privacy policy for NemotronATS",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#090510] text-white py-32 px-6 relative z-10" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none text-white/70 space-y-6">
          <p className="text-lg">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-[#d8b4fe] mt-8 mb-4">1. Local-First Data Storage</h2>
            <p>
              NemotronATS is designed with a local-first architecture. When you upload a resume or job description, the data is stored exclusively on your local machine in a <code>.data/db.json</code> file. 
              We do not use any third-party cloud database (like Firebase, Supabase, or AWS) to persistently store your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#d8b4fe] mt-8 mb-4">2. AI Inference & NVIDIA NIM</h2>
            <p>
              To provide you with ATS scoring and interview generation, the text extracted from your resume is sent to NVIDIA NIM APIs for inference.
              This data is sent securely, analyzed by the Nemotron models, and the resulting insights are returned directly to your local application.
              Your data is not used by NemotronATS to train any AI models.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#d8b4fe] mt-8 mb-4">3. Data Deletion</h2>
            <p>
              Because your data is stored locally, you have complete control over it. You can delete your historical resumes and analysis reports at any time by clicking the delete (trash) icon in the "History" tab of your dashboard.
              Once deleted from your local file, it cannot be recovered.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#d8b4fe] mt-8 mb-4">4. Analytics & Cookies</h2>
            <p>
              We may use standard session management tools (like Clerk) for authentication purposes. Aside from strictly necessary authentication tokens, NemotronATS minimizes tracking and does not sell your data to any third party.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
