'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Search, MessageSquare, Stethoscope, User, Globe } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<'doctor' | 'patient'>('doctor');
  const [doctorLanguage, setDoctorLanguage] = useState('English');
  const [patientLanguage, setPatientLanguage] = useState('Spanish');
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/conversations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_language: doctorLanguage,
          patient_language: patientLanguage,
          title: title || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      router.push(`/chat/${data.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const goToSearch = () => {
    router.push('/search');
  };

  const goToHistory = () => {
    router.push('/history');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Stethoscope className="h-10 w-10 text-blue-600" />
              Medical Translation Assistant
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Real-time translation for doctor-patient communication
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
              <User className="h-5 w-5 text-gray-500 mr-2" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'doctor' | 'patient')}
                className="bg-transparent outline-none text-gray-800"
              >
                <option value="doctor">👨‍⚕️ Doctor</option>
                <option value="patient">👤 Patient</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Start Conversation */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Start New Consultation</h2>
            </div>
            
            <form onSubmit={handleCreateConversation} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Globe className="h-4 w-4 inline mr-2" />
                    Doctor Language
                  </label>
                  <select
                    value={doctorLanguage}
                    onChange={(e) => setDoctorLanguage(e.target.value)}
                    className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  >
                    <option value="English">🇺🇸 English</option>
                    <option value="Spanish">🇪🇸 Spanish</option>
                    <option value="French">🇫🇷 French</option>
                    <option value="German">🇩🇪 German</option>
                    <option value="Chinese">🇨🇳 Chinese</option>
                    <option value="Hindi">🇮🇳 Hindi</option>
                    <option value="Arabic">🇸🇦 Arabic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Globe className="h-4 w-4 inline mr-2" />
                    Patient Language
                  </label>
                  <select
                    value={patientLanguage}
                    onChange={(e) => setPatientLanguage(e.target.value)}
                    className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  >
                    <option value="Spanish">🇪🇸 Spanish</option>
                    <option value="English">🇺🇸 English</option>
                    <option value="French">🇫🇷 French</option>
                    <option value="German">🇩🇪 German</option>
                    <option value="Chinese">🇨🇳 Chinese</option>
                    <option value="Hindi">🇮🇳 Hindi</option>
                    <option value="Arabic">🇸🇦 Arabic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Consultation Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Annual Checkup for John Smith"
                  className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 font-semibold text-lg flex items-center justify-center"
              >
                {isCreating ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Creating Consultation...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-5 w-5 mr-3" />
                    Start New Chat Session
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Quick Actions */}
          <div className="space-y-6">
            {/* Search Card */}
            <div 
              onClick={goToSearch}
              className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-shadow duration-200 border-2 border-transparent hover:border-blue-200"
            >
              <div className="flex items-center mb-6">
                <div className="bg-emerald-100 p-3 rounded-full mr-4">
                  <Search className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Search Conversations</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Find specific symptoms, medications, or discussions across all consultations using AI-powered search.
              </p>
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-emerald-800 text-sm font-medium">
                  🔍 Search for: "headache", "prescription", "follow-up", etc.
                </p>
              </div>
              <button className="mt-6 w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center">
                <Search className="h-5 w-5 mr-3" />
                Open Search
              </button>
            </div>

            {/* Features Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6">Key Features</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mic className="h-5 w-5 mr-3 text-blue-200" />
                  <span>Real-time audio recording & transcription</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-3 text-blue-200" />
                  <span>AI-powered translation between 7 languages</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-3 text-blue-200" />
                  <span>Conversation history & AI summarization</span>
                </div>
                <div className="flex items-center">
                  <Search className="h-5 w-5 mr-3 text-blue-200" />
                  <span>Medical keyword search across conversations</span>
                </div>
              </div>
            </div>
          </div>
        </div>

       </div>
    </main>
  );
}