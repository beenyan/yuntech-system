import { defineStore } from 'pinia';

const cookieStorageKey = 'cookies';

class Cookie {
  key: string;
  value: string;

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
  }
}

export const useCookiesStore = defineStore('Cookies', () => {
  const getCookiesArray = (): Cookie[] => {
    const storedCookies = localStorage.getItem(cookieStorageKey);
    return storedCookies ? JSON.parse(storedCookies) : [];
  };

  const getCookies = (): string => {
    return getCookiesArray()
      .map((cookie) => `${cookie.key}=${cookie.value}`)
      .join('; ');
  };

  const setCookies = (cookies: Array<string>) => {
    const cookieParse = cookies.map((cookie) => {
      const cookiePairs = cookie.split('; ')[0];
      const indexOfFirstEqual = cookiePairs.indexOf('=');
      return new Cookie(cookiePairs.substring(0, indexOfFirstEqual), cookiePairs.substring(indexOfFirstEqual + 1));
    });

    const cookieArray = getCookiesArray();
    cookieParse.forEach((cookie) => {
      const index = cookieArray.findIndex((c) => c.key === cookie.key);
      index === -1 ? cookieArray.push(cookie) : (cookieArray[index] = cookie);
    });

    localStorage.setItem(cookieStorageKey, JSON.stringify(cookieArray));
  };

  const clearCookies = () => {
    localStorage.removeItem(cookieStorageKey);
  };

  return { getCookiesArray, getCookies, setCookies, clearCookies };
});
