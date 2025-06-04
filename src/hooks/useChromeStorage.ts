export const useChromeStorage = () => {
  return {
    setKey: async (key: string, value: string) => {
      await chrome.storage.local.set({ [key]: value });
    },

    getKeyValue: async (key: string) => {
      const result = await chrome.storage.local.get(key);
      return result[key];
    },
  };
};
