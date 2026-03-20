import { useState, useEffect } from 'react';
import { GachaItem } from '@/components/GachaSystem';

export function useGachaCollection() {
  const [collection, setCollection] = useState<GachaItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('uma_gacha_collection_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: Add category 'uma' to legacy items that don't have one
        const migrated = parsed.map((item: GachaItem) => ({
          ...item,
          category: item.category || 'uma'
        }));
        setCollection(migrated);
      } catch (e) {
        console.error("Failed to load gacha collection", e);
      }
    }
  }, []);

  // Save to localStorage whenever collection changes
  useEffect(() => {
    localStorage.setItem('uma_gacha_collection_v1', JSON.stringify(collection));
  }, [collection]);

  const addToCollection = (items: GachaItem[]) => {
    setCollection(prev => {
      // Avoid duplicates based on name/rarity for specific gachas, 
      // or just keep all as unique instances (usually better for collection history)
      // For now, let's keep unique items by 'name' and 'rarity' to avoid cluttering 
      // the inventory with thousands of duplicates, but mark 'count'.
      
      const newCollection = [...prev];
      items.forEach(item => {
        // If it's a new item or SSR, we definitely want it
        // To keep it simple, we'll just append everything but maybe filter by rarity 
        // if the user wants only high tier? No, they said "hasil gachanya".
        
        // Let's filter to keep unique items by ID (if provided) or name+rarity
        const exists = newCollection.find(c => c.name === item.name && c.rarity === item.rarity);
        if (!exists) {
          newCollection.push(item);
        }
      });
      return newCollection;
    });
  };

  const clearCollection = () => {
    setCollection([]);
  };

  return { collection, addToCollection, clearCollection };
}
