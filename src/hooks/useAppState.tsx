import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react';
import type { Image, PromptTemplate, Video, AppState } from '@/types';
import { saveState, loadState, saveImageBlob, removeImageBlob, clearImageBlobs } from '@/services/persistence';

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

  // Hydrate from persistence on mount
  useEffect(() => {
    let cancelled = false;
    loadState().then((saved) => {
      if (!cancelled && Object.keys(saved).length > 0) {
        dispatch({ type: 'HYDRATE', payload: saved });
      }
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Persist state changes (skip during hydrate)
  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  // Side-effect: sync image blobs to IndexedDB
  useEffect(() => {
    if (!hydrated) return;

    // When images are removed or cleared, clean up IndexedDB
    // New images are saved in the Upload page on-drop handler (see useImageUpload)
  }, [state.uploadedImages, hydrated]);

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
