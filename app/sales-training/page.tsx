'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import SalesTrainer from '../../components/SalesTrainer';

// Placeholder DMSetting component
function DMSetting() {
  return (
    <button className="px-5 py-2 rounded-lg bg-zinc-900 text-purple-300 border border-zinc-800 font-semibold hover:bg-zinc-800 transition-all ml-2">DM Setting</button>
  );
}

// Step titles and descriptions
const steps = [
  {
    title: 'Select Prospect Type',
    description: 'Choose the type of prospect for your simulation.',
  },
  {
    title: 'Basic Information',
    description: 'Enter basic details about your prospect.',
  },
  {
    title: 'Business Profile',
    description: 'Provide business-related information.',
  },
  {
    title: 'Your Offer',
    description: 'Describe your offer and training goals.',
  },
  {
    title: 'Simulation Details',
    description: 'Set up the simulation scenario.',
  },
  {
    title: 'Summary & Launch',
    description: 'Review and confirm your prospect setup.',
  },
];

type StepWizardProps = {
  open: boolean;
  onClose: () => void;
};

type FormField = keyof typeof initialForm;

const initialForm = {
  prospectType: '',
  name: 'John Smith',
  age: 35,
  position: '',
  industry: '',
  companySize: '',
  product: '',
  trainingGoals: '',
  expectedObjections: '',
  callType: '',
  successGoals: '',
  feedbackWanted: '',
};

// Add a type for a Prospect
interface Prospect {
  id: string;
  userId?: string;
  prospectType: string;
  name: string;
  age: number;
  position: string;
  industry: string;
  companySize: string;
  product: string;
  trainingGoals: string;
  expectedObjections: string;
  callType: string;
  successGoals: string;
  feedbackWanted: string;
}

function StepWizard({ open, onClose, onCreate }: StepWizardProps & { onCreate: (prospect: Omit<Prospect, 'id' | 'userId'>) => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...initialForm });

  const handleChange = (field: string, value: any) => setForm({ ...form, [field]: value });
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative border border-zinc-800">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-xl">×</button>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-lg font-bold text-purple-400">{steps[step].title}</div>
            <div className="text-xs text-zinc-400">Step {step + 1} of {steps.length}</div>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>
        {/* Step Content */}
        <div className="mb-8 min-h-[180px]">
          {step === 0 && (
            <div>
              <div className="flex gap-4 mt-4">
                <button
                  className={`flex-1 p-6 rounded-xl border-2 ${form.prospectType === 'B2B' ? 'border-purple-500 bg-zinc-800' : 'border-zinc-800 bg-zinc-900'} hover:border-purple-400 transition-all flex flex-col items-center`}
                  onClick={() => handleChange('prospectType', 'B2B')}
                >
                  <span className="text-xl font-bold mb-2">Business (B2B)</span>
                  <span className="text-zinc-400 text-sm">Business clients with company roles</span>
                </button>
                <button
                  className={`flex-1 p-6 rounded-xl border-2 ${form.prospectType === 'B2C' ? 'border-purple-500 bg-zinc-800' : 'border-zinc-800 bg-zinc-900'} hover:border-purple-400 transition-all flex flex-col items-center`}
                  onClick={() => handleChange('prospectType', 'B2C')}
                >
                  <span className="text-xl font-bold mb-2">Consumer (B2C)</span>
                  <span className="text-zinc-400 text-sm">Individual consumers for personal sales</span>
                </button>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-zinc-200 font-semibold mb-1">Name <span className="text-purple-400 cursor-pointer" title="The name of your prospect.">ⓘ</span></label>
                <input type="text" className="w-full bg-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.name} onChange={e => handleChange('name', e.target.value)} />
              </div>
              <div>
                <label className="block text-zinc-200 font-semibold mb-1">Age <span className="text-purple-400 cursor-pointer" title="The age of your prospect.">ⓘ</span></label>
                <input type="number" className="w-full bg-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.age} onChange={e => handleChange('age', e.target.value)} />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-zinc-200 font-semibold mb-1">Position <span className="text-purple-400 cursor-pointer" title="Prospect's job position.">ⓘ</span></label>
                <input type="text" className="w-full bg-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.position} onChange={e => handleChange('position', e.target.value)} placeholder="e.g. Marketing Manager" />
              </div>
              <div>
                <label className="block text-zinc-200 font-semibold mb-1">Industry <span className="text-purple-400 cursor-pointer" title="Prospect's industry.">ⓘ</span></label>
                <input type="text" className="w-full bg-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.industry} onChange={e => handleChange('industry', e.target.value)} placeholder="e.g. SaaS" />
              </div>
              <div>
                <label className="block text-zinc-200 font-semibold mb-1">Company Size <span className="text-purple-400 cursor-pointer" title="Size of the company.">ⓘ</span></label>
                <select className="w-full bg-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.companySize} onChange={e => handleChange('companySize', e.target.value)}>
                  <option value="">Select size</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-1000">201-1000</option>
                  <option value=">1000">1000+</option>
                </select>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-zinc-200 font-semibold mb-1">Product or Service <span className="text-purple-400 cursor-pointer" title="Describe your offer.">ⓘ</span></label>
                <textarea className="w-full bg-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.product} onChange={e => handleChange('product', e.target.value)} placeholder="My company sells a $1,500/month social media management service…" />
              </div>
              <div>
                <label className="block text-zinc-200 font-semibold mb-1">Training Goals <span className="text-purple-400 cursor-pointer" title="What do you want to practice?">ⓘ</span></label>
                <input type="text" className="w-full bg-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.trainingGoals} onChange={e => handleChange('trainingGoals', e.target.value)} placeholder="e.g. Objection handling" />
              </div>
              <div>
                <label className="block text-zinc-200 font-semibold mb-1">Expected Objections <span className="text-purple-400 cursor-pointer" title="What objections do you expect?">ⓘ</span></label>
                <input type="text" className="w-full bg-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.expectedObjections} onChange={e => handleChange('expectedObjections', e.target.value)} placeholder="e.g. Too expensive" />
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-zinc-200 font-semibold mb-1">Call Type <span className="text-purple-400 cursor-pointer" title="Type of sales call.">ⓘ</span></label>
                <input type="text" className="w-full bg-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.callType} onChange={e => handleChange('callType', e.target.value)} placeholder="e.g. Discovery call" />
              </div>
              <div>
                <label className="block text-zinc-200 font-semibold mb-1">Success Goals <span className="text-purple-400 cursor-pointer" title="What does success look like?">ⓘ</span></label>
                <input type="text" className="w-full bg-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.successGoals} onChange={e => handleChange('successGoals', e.target.value)} placeholder="e.g. Book a follow-up meeting" />
              </div>
              <div>
                <label className="block text-zinc-200 font-semibold mb-1">Feedback Wanted <span className="text-purple-400 cursor-pointer" title="What feedback do you want?">ⓘ</span></label>
                <textarea className="w-full bg-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.feedbackWanted} onChange={e => handleChange('feedbackWanted', e.target.value)} placeholder="I want feedback on how well I handled objections…" />
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-zinc-200 font-semibold">Review your entries and launch your AI prospect.</div>
              <pre className="bg-zinc-800 rounded-lg p-4 text-xs text-purple-200 overflow-x-auto">
{JSON.stringify(form, null, 2)}
              </pre>
            </div>
          )}
        </div>
        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            className={`px-5 py-2 rounded-lg font-semibold transition-all ${step === 0 ? 'opacity-0 pointer-events-none' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
            onClick={back}
          >Back</button>
          {step < steps.length - 1 ? (
            <button
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold hover:scale-105 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              onClick={next}
              disabled={step === 0 && !form.prospectType}
            >Continue</button>
          ) : (
            <button
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold hover:scale-105 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onClick={() => {
                onCreate(form);
                onClose();
              }}
            >Finish</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SalesTrainingPage() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTrainer, setShowTrainer] = useState<Prospect | null>(null);

  // Placeholder userId
  const userId = 'demo-user';

  // Fetch prospects from Firestore
  useEffect(() => {
    async function fetchProspects() {
      setLoading(true);
      const q = query(collection(db, 'prospects'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const data: Prospect[] = [];
      querySnapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<Prospect, 'id'>) });
      });
      setProspects(data);
      setLoading(false);
    }
    fetchProspects();
  }, []);

  // Create a new prospect in Firestore
  async function handleCreateProspect(form: Omit<Prospect, 'id' | 'userId'>) {
    const docRef = await addDoc(collection(db, 'prospects'), { ...form, userId });
    setProspects((prev) => [
      { ...form, id: docRef.id, userId },
      ...prev,
    ]);
  }

  // Delete a prospect
  async function handleDeleteProspect(id: string) {
    await deleteDoc(doc(db, 'prospects', id));
    setProspects((prev) => prev.filter((p) => p.id !== id));
  }

  // Group prospects by type
  const groupedProspects = prospects.reduce<{ [key: string]: Prospect[] }>((acc, p) => {
    if (!acc[p.prospectType]) acc[p.prospectType] = [];
    acc[p.prospectType].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white px-4 md:px-12 py-8">
      {showTrainer ? (
        <SalesTrainer
          prospect={showTrainer}
          onBack={() => setShowTrainer(null)}
        />
      ) : (
        <div className="max-w-7xl mx-auto bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 p-8">
          <h2 className="text-3xl font-extrabold text-white mb-6 text-center">Sales Training <span className="text-sm bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full">AI-Powered</span></h2>

          <div className="flex items-center mb-6">
            <button
              onClick={() => { /* Logic to filter prospects if needed */ }}
              className="px-5 py-2 rounded-lg bg-purple-700 text-white font-semibold hover:bg-purple-800 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              My Sales Prospects
            </button>
            <DMSetting />
            <button
              onClick={() => setWizardOpen(true)}
              className="ml-auto px-5 py-2 rounded-lg bg-purple-700 text-white font-semibold hover:bg-purple-800 transition-all shadow-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Create New Agent 🤖
            </button>
          </div>

          <div className="flex items-center mb-6">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search prospects..."
                className="w-full bg-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <button className="ml-4 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
              All Types
            </button>
            <button className="ml-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Newest
            </button>
          </div>

          {loading ? (
            <div className="text-center text-zinc-400 py-10">Loading prospects...</div>
          ) : prospects.length === 0 ? (
            <div className="text-center text-zinc-400 py-10">No prospects found. Create a new agent to get started!</div>
          ) : (
            <div className="space-y-10 mt-8">
              {Object.entries(groupedProspects).map(([type, group]) => (
                <div key={type}>
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    {type} Prospects <span className="bg-purple-600/30 text-purple-200 text-sm px-3 py-1 rounded-full">{group.length}</span>
                  </h3>
                  <p className="text-zinc-400 mb-6">{type === 'B2B' ? 'Business-to-business prospects for company sales' : 'Individual consumers for personal sales'}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.map((prospect) => (
                      <div key={prospect.id} className="bg-zinc-800 rounded-xl p-6 shadow-lg border border-zinc-700 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 relative group">
                        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-zinc-400 hover:text-white" title="Copy Link"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4 2a2 2 0 01-2-2V9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2h-4zm0 0l-4 4"></path></svg></button>
                          <button onClick={() => setWizardOpen(true)} className="text-zinc-400 hover:text-white" title="Edit"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-5L17 4m-4 7l4-4"></path></svg></button>
                          <button onClick={() => handleDeleteProspect(prospect.id)} className="text-red-400 hover:text-red-300" title="Delete"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full mb-3 ${prospect.prospectType === 'B2B' ? 'bg-blue-600/30 text-blue-200' : 'bg-green-600/30 text-green-200'}`}>{prospect.prospectType}</span>
                        <h4 className="text-xl font-bold mb-2">{prospect.name}</h4>
                        <p className="text-zinc-400 text-sm mb-1">SALES TYPE: {prospect.callType}</p>
                        <p className="text-zinc-400 text-sm mb-4">OBJECTIVES: {prospect.expectedObjections}</p>
                        <button
                          onClick={() => setShowTrainer(prospect)}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:scale-105 transition-transform duration-300 shadow-md"
                        >
                          Start Training
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <StepWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onCreate={handleCreateProspect} />
        </div>
      )}
    </div>
  );
} 