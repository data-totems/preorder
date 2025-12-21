import { create } from 'zustand'

export const useUserStore = create<UserStoreProps>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))


export const useSetupStore = create<useStoreProps>((set) => ({
  store: null,
  setStore: (store) => set({ store }),
}))
