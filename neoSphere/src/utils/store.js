// src/store.js
import { create } from 'zustand';

const useAsteroidStore = create((set) => ({
  asteroids: [],
  selectedAsteroid: null,
  searchTerm: '',
  filter: 'non-pha', // For PHA status
  nameFilter: 'all', // New state for name filter
  diameterFilter: 'all', // Existing state for diameter
  
  setAsteroids: (data) => set({ asteroids: data }),
  setSelectedAsteroid: (asteroid) => set({ selectedAsteroid: asteroid }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setFilter: (filterType) => set({ filter: filterType }),
  setNameFilter: (filter) => set({ nameFilter: filter }), // New setter for name filter
  setDiameterFilter: (size) => set({ diameterFilter: size }),
}));

export default useAsteroidStore;