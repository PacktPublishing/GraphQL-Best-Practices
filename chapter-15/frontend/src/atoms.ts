import { ClientType, SalonType } from '@/graphql/selectors';
import { atom } from 'jotai';

const atomWithLocalStorage = <T>(key: string, initialValue: T) => {
  const getInitialValue = () => {
    const item = localStorage.getItem(key);
    if (item !== null) {
      return JSON.parse(item) as T;
    }
    return initialValue;
  };
  const baseAtom = atom(getInitialValue());
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue =
        typeof update === 'function' ? update(get(baseAtom)) : update;
      set(baseAtom, nextValue);
      localStorage.setItem(key, JSON.stringify(nextValue));
    },
  );
  return derivedAtom;
};

export const jwtToken = atomWithLocalStorage('token', '');

export const clientData = atomWithLocalStorage<ClientType | undefined>(
  'clientData',
  undefined,
);

export const salonData = atomWithLocalStorage<SalonType | undefined>(
  'salonData',
  undefined,
);
