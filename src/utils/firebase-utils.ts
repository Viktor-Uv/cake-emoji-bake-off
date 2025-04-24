export const isUsingEmulators = (): boolean => {
  const isDevEnv = import.meta.env.DEV;
  const isUsingEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
  return isDevEnv && isUsingEmulators;
};

export const getEmulatorHost = (service: 'auth' | 'firestore' | 'storage' | 'functions'): string => {
  const portMap: Record<string, number> = {
    auth: 9099,
    firestore: 8081,
    storage: 9199,
    functions: 5001
  };

  return `http://localhost:${portMap[service]}`;
};
