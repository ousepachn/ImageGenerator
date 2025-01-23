'use client';

import { useState } from 'react';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
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

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/generator');
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const ModelCard = ({ modelKey, model, isSelected, onSelect }) => {
    console.log(`Rendering ModelCard for ${modelKey}:`, { isSelected });
    
    return (
      <button
        type="button"
        onClick={() => {
          console.log(`Clicking ${modelKey} button`);
          onSelect(modelKey);
        }}
        data-selected={isSelected}
        data-model={modelKey}
        style={{
          borderColor: isSelected ? '#4466FF' : '#E5E7EB',
          backgroundColor: isSelected ? '#F5F7FF' : '#FFFFFF',
          borderRadius: '16px',
          borderWidth: '2px',
          borderStyle: 'solid',
          padding: '1rem',
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          fontFamily: 'inherit',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        className={`group relative flex flex-col items-center !rounded-2xl transition-all duration-200 w-full !border-2
          ${isSelected 
            ? '!bg-[#F5F7FF] !border-[#4466FF]'
            : 'bg-white hover:bg-gray-50 !border-gray-200 hover:!border-[#4466FF]'
          }
          focus:!outline-none focus:!ring-2 focus:!ring-[#4466FF] focus:!ring-offset-2`}
      >
        <div 
          style={{
            color: isSelected ? '#4466FF' : '#6B7280',
            borderRadius: '9999px',
            padding: '0.5rem',
            marginBottom: '0.5rem'
          }}
          className={`rounded-full transition-colors duration-200
            ${isSelected 
              ? '!text-[#4466FF] bg-white/50' 
              : 'text-gray-500 group-hover:text-[#4466FF]'
            }`}
        >
          {model.icon}
        </div>
        <h3 
          style={{
            margin: '0',
            marginBottom: '0.25rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: isSelected ? '#4466FF' : '#111827'
          }}
          className={`font-medium transition-colors duration-200 ${
            isSelected ? 'text-[#4466FF]' : 'text-gray-900'
          }`}
        >
          {model.name}
        </h3>
        <p className="text-xs text-gray-500 text-center m-0">{model.description}</p>
      </button>
    );
  };

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold">AI Image Generator</h1>
          <p className="text-lg text-gray-600">Create stunning images with artificial intelligence</p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 w-full max-w-xs py-3 px-6 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          {error && (
            <div className="w-full max-w-xs p-4 bg-red-50 rounded-md">
              <p className="text-red-600 text-center text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 