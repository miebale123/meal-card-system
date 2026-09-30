// Browsers have no SecureStore. Tab storage, as in exceed-help-desk, signs out when the tab closes,
// which suits shared office computers.
export const getItem = async (key: string) => sessionStorage.getItem(key);
export const setItem = async (key: string, value: string) => sessionStorage.setItem(key, value);
export const removeItem = async (key: string) => sessionStorage.removeItem(key);
