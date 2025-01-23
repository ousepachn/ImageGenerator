'use client';

import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { useRouter } from 'next/navigation';

const MODELS = {
  'stable-diffusion': {
    name: 'Stable Diffusion XL',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    description: "High-quality image generation with great composition"
  },
  'flux': {
    name: 'Flux Pro 1.1',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5L12 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    description: "Excellent image quality and prompt adherence"
  },
  'ideogram': {
    name: 'Ideogram v2',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    description: "Excellent text rendering and prompt comprehension"
  }
};

export default function Generator() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('stable-diffusion');
  const [user, setUser] = useState(null);
  const [generationId, setGenerationId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    let pollInterval;

    const checkStatus = async () => {
      if (!generationId) return;

      try {
        const response = await fetch(`/api/status?id=${generationId}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
          setGenerationId(null);
          setIsLoading(false);
          return;
        }

        if (data.status === 'success' && data.imageUrl) {
          setImageUrl(data.imageUrl);
          setGenerationId(null);
          setIsLoading(false);
          return;
        }

        if (data.status === 'error') {
          setError(data.error || 'Failed to generate image');
          setGenerationId(null);
          setIsLoading(false);
          return;
        }

        // Continue polling if still processing
      } catch (err) {
        console.error('Error checking status:', err);
        setError('Failed to check generation status');
        setGenerationId(null);
        setIsLoading(false);
      }
    };

    if (generationId) {
      pollInterval = setInterval(checkStatus, 1000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [generationId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setGenerationId(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          model: selectedModel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.error) {
        setError(data.error);
        setIsLoading(false);
      } else if (data.id) {
        setGenerationId(data.id);
      } else {
        setError('No generation ID received from the server');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to generate image. Please try again.');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const ModelCard = ({ modelKey, model, isSelected, onSelect }) => (
    <button
      type="button"
      onClick={() => onSelect(modelKey)}
      className={`group relative flex flex-col items-center p-6 rounded-2xl transition-all duration-200 w-full border-2
        ${isSelected 
          ? 'bg-[#F5F7FF] border-[#4466FF]'
          : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-[#4466FF]'
        }
        focus:outline-none focus:ring-2 focus:ring-[#4466FF] focus:ring-offset-2`}
    >
      <div className={`p-4 rounded-full mb-3 transition-colors duration-200
        ${isSelected 
          ? 'text-[#4466FF]' 
          : 'text-gray-600 group-hover:text-[#4466FF]'
        }`}
      >
        {model.icon}
      </div>
      <h3 className={`font-medium mb-2 ${isSelected ? 'text-[#4466FF]' : 'text-gray-900'}`}>
        {model.name}
      </h3>
      <p className="text-sm text-gray-500 text-center">{model.description}</p>
    </button>
  );

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-['Roboto']">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-[#4466FF] text-2xl">▲</span>
            <span className="font-medium">Mount Cursor</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user.email}</span>
            <button
              onClick={() => auth.signOut()}
              className="text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-medium text-gray-900 mb-4">AI Image Generator</h1>
          <p className="text-xl text-gray-600">
            Transform your ideas into stunning visuals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {Object.entries(MODELS).map(([key, model]) => (
            <ModelCard
              key={key}
              modelKey={key}
              model={model}
              isSelected={selectedModel === key}
              onSelect={setSelectedModel}
            />
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the image you want to generate..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4466FF] focus:border-transparent"
            rows="4"
            required
          />

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`mt-4 w-full py-3 rounded-xl text-white font-medium ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4466FF] hover:bg-[#3355EE]'
            }`}
          >
            {isLoading ? 'Generating...' : 'Generate Image'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-xl">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          {imageUrl && (
            <div className="mt-8 flex justify-center">
              <div style={{ width: '50%', maxWidth: '50vw' }} className="relative">
                <div className="w-full relative overflow-hidden rounded-xl shadow-lg" style={{ maxHeight: '70vh' }}>
                  <img
                    src={imageUrl}
                    alt="Generated"
                    className="w-full h-full object-scale-down"
                    style={{ maxHeight: '70vh' }}
                  />
                </div>
                <p className="mt-3 text-sm text-gray-500 text-center">
                  Generated with {MODELS[selectedModel].name}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 