import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react';
import type { Image, PromptTemplate, Video, AppState, UserProfile, UsageLimits } from '@/types';
import { saveState, loadState, saveImageBlob, removeImageBlob, clearImageBlobs } from '@/services/persistence';
import { api } from '@/lib/api';

/* ---------- Action Types ---------- */
type Action =
  | { type: 'SET_STEP'; payload: AppState['currentStep'] }
  | { type: 'ADD_IMAGE'; payload: Image }
  | { type: 'REMOVE_IMAGE'; payload: string }
  | { type: 'CLEAR_IMAGES' }
  | { type: 'SELECT_IMAGE'; payload: Image | null }
  | { type: 'SELECT_TEMPLATE'; payload: PromptTemplate | null }
  | { type: 'SET_PROMPT'; payload: string }
  | { type: 'ADD_VIDEO'; payload: Video }
  | { type: 'UPDATE_VIDEO'; payload: { id: string; updates: Partial<Video> } }
  | { type: 'REMOVE_VIDEO'; payload: string }
  | { type: 'SET_CURRENT_VIDEO'; payload: Video | null }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'SET_USAGE_LIMITS'; payload: UsageLimits | null }
  | { type: 'INCREMENT_USAGE'; payload: 'promptGen' | 'imageAnalysis' | 'videoGen' }
  | { type: 'HYDRATE'; payload: Partial<AppState> };

/* ---------- Initial State ---------- */
const initialState: AppState = {
  currentStep: 'upload',
  uploadedImages: [],
  selectedImage: null,
  selectedTemplate: null,
  generatedPrompt: '',
  videos: [],
  currentVideo: null,
  user: null,
  usageLimits: null,
};

/* ---------- Reducer ---------- */
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'ADD_IMAGE':
      return {
        ...state,
        uploadedImages: [...state.uploadedImages, action.payload],
        selectedImage: action.payload,
      };
    case 'REMOVE_IMAGE':
      return {
        ...state,
        uploadedImages: state.uploadedImages.filter((img) => img.id !== action.payload),
        selectedImage:
          state.selectedImage?.id === action.payload ? null : state.selectedImage,
      };
    case 'CLEAR_IMAGES':
      return { ...state, uploadedImages: [], selectedImage: null };
    case 'SELECT_IMAGE':
      return { ...state, selectedImage: action.payload };
    case 'SELECT_TEMPLATE':
      return { ...state, selectedTemplate: action.payload };
    case 'SET_PROMPT':
      return { ...state, generatedPrompt: action.payload };
    case 'ADD_VIDEO':
      return {
        ...state,
        videos: [action.payload, ...state.videos],
        currentVideo: action.payload,
      };
    case 'UPDATE_VIDEO':
      return {
        ...state,
        videos: state.videos.map((v) =>
          v.id === action.payload.id ? { ...v, ...action.payload.updates } : v,
        ),
        currentVideo:
          state.currentVideo?.id === action.payload.id
            ? { ...state.currentVideo, ...action.payload.updates }
            : state.currentVideo,
      };
    case 'REMOVE_VIDEO':
      return {
        ...state,
        videos: state.videos.filter((v) => v.id !== action.payload),
        currentVideo:
          state.currentVideo?.id === action.payload ? null : state.currentVideo,
      };
    case 'SET_CURRENT_VIDEO':
      return { ...state, currentVideo: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_USAGE_LIMITS':
      return { ...state, usageLimits: action.payload };
    case 'INCREMENT_USAGE': {
      if (!state.usageLimits) return state;
      const key = action.payload;
      return {
        ...state,
        usageLimits: {
          ...state.usageLimits,
          [key]: { ...state.usageLimits[key], used: state.usageLimits[key].used + 1 },
        },
      };
    }
    default:
      return state;
  }
}

/* ---------- Context ---------- */
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  hydrated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from persistence + restore auth session on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Load persisted app state
      const saved = await loadState();
      if (!cancelled && Object.keys(saved).length > 0) {
        dispatch({ type: 'HYDRATE', payload: saved });
      }

      // Restore auth session from JWT token
      const token = localStorage.getItem('ij_token');
      if (token) {
        const { data, error } = await api.get<{
          id: string;
          email: string;
          displayName: string | null;
          role: 'user' | 'admin';
          subscriptionTier: 'free' | 'paid';
          createdAt: string;
        }>('/profile');

        if (!cancelled && data && !error) {
          dispatch({
            type: 'SET_USER',
            payload: {
              id: data.id,
              email: data.email,
              displayName: data.displayName,
              role: data.role,
              subscriptionTier: data.subscriptionTier,
              createdAt: new Date(data.createdAt),
            },
          });
        } else if (error) {
          // Token expired or invalid, clear it
          localStorage.removeItem('ij_token');
        }
      }

      if (!cancelled) {
        setHydrated(true);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // Persist state changes (skip during hydrate)
  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  return (
    <AppContext.Provider value={{ state, dispatch, hydrated }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppProvider');
  }
  return context;
}

// Re-export persistence helpers for use in components
export { saveImageBlob, removeImageBlob, clearImageBlobs };
