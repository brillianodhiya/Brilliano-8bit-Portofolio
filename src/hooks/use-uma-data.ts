import { useState, useEffect } from 'react';
import { GachaItem } from '@/components/GachaSystem';
import { BOOTSTRAP_CHARACTERS, BOOTSTRAP_SUPPORTS, BOOTSTRAP_BANNERS } from '@/data/uma_bootstrap';

export interface UmaBanner {
  id: number;
  name: string;
  image: string;
  type: 'character' | 'support';
  featured: string[]; // IDs of featured items
  start: number;
  end: number;
}

export interface UmaData {
  characterPool: GachaItem[];
  supportPool: GachaItem[];
  currentBanners: {
    character?: UmaBanner;
    support?: UmaBanner;
  };
  loading: boolean;
  error: string | null;
  isLive: boolean;
}

const GAMETORA_BASE = 'https://gametora.com';

async function fetchJsonResilient(url: string) {
  const encodedUrl = encodeURIComponent(url);
  
  // 1. AllOrigins RAW
  try {
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodedUrl}`);
    if (res.ok) return await res.json();
  } catch (e) {}

  // 2. AllOrigins GET (wrapped)
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodedUrl}`);
    if (res.ok) {
      const data = await res.json();
      if (data.contents) return JSON.parse(data.contents);
    }
  } catch (e) {}

  // 3. CorsProxy.io
  try {
    const res = await fetch(`https://corsproxy.io/?url=${encodedUrl}`);
    if (res.ok) return await res.json();
  } catch (e) {}

  throw new Error("Proxy sync failed.");
}

export function useUmaData(): UmaData {
  const [data, setData] = useState<UmaData>({
    characterPool: BOOTSTRAP_CHARACTERS,
    supportPool: BOOTSTRAP_SUPPORTS,
    currentBanners: BOOTSTRAP_BANNERS,
    loading: true,
    error: null,
    isLive: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const manifest = await fetchJsonResilient(`${GAMETORA_BASE}/data/manifests/umamusume.json`);
        const charHash = manifest['character-cards'];
        const supportHash = manifest['support-cards'];
        const gachaHash = manifest['gacha/char-standard'];

        if (!isMounted) return;

        const [charData, supportData, gachaData] = await Promise.all([
          fetchJsonResilient(`${GAMETORA_BASE}/data/umamusume/character-cards.${charHash}.json`),
          fetchJsonResilient(`${GAMETORA_BASE}/data/umamusume/support-cards.${supportHash}.json`),
          fetchJsonResilient(`${GAMETORA_BASE}/data/umamusume/gacha/char-standard.${gachaHash}.json`),
        ]);

        if (!isMounted) return;

        const characterPool: GachaItem[] = charData
          .filter((c: any) => c.obtained === 'gacha')
          .map((c: any) => ({
            id: c.card_id.toString(),
            name: c.name_en || c.name,
            rarity: c.rarity === 3 ? 'SSR' : c.rarity === 2 ? 'SR' : 'R',
            image: `https://images.weserv.nl/?url=${GAMETORA_BASE}/images/umamusume/characters/thumb/chara_stand_${Math.floor(c.card_id/100)}_${c.card_id}.png`
          }));

        const supportPool: GachaItem[] = supportData
          .map((s: any) => ({
            id: s.support_id.toString(),
            name: s.char_name || s.name_en,
            rarity: s.rarity === 'SSR' ? 'SSR' : s.rarity === 'SR' ? 'SR' : 'R',
            image: `https://images.weserv.nl/?url=${GAMETORA_BASE}/images/umamusume/supports/support_card_s_${s.support_id}.png`
          }));

        const now = Date.now() / 1000;
        const history = [...gachaData].reverse();
        const charB = history.find((b: any) => b.type === 1 && now >= b.start && now <= b.end) || history.find((b: any) => b.type === 1);
        const suppB = history.find((b: any) => b.type === 2 && now >= b.start && now <= b.end) || history.find((b: any) => b.type === 2);

        const currentBanners: UmaData['currentBanners'] = {};
        if (charB) {
          currentBanners.character = {
            id: charB.id,
            name: "Pretty Derby Scout",
            image: `https://images.weserv.nl/?url=${GAMETORA_BASE}/images/umamusume/en/gacha/img_bnr_gacha_${charB.id}.png`,
            type: 'character',
            featured: charB.pickups.map((p: any) => p.toString()),
            start: charB.start,
            end: charB.end
          };
        }
        if (suppB) {
          currentBanners.support = {
            id: suppB.id,
            name: "Support Card Gacha",
            image: `https://images.weserv.nl/?url=${GAMETORA_BASE}/images/umamusume/en/gacha/img_bnr_gacha_${suppB.id}.png`,
            type: 'support',
            featured: suppB.pickups.map((p: any) => p.toString()),
            start: suppB.start,
            end: suppB.end
          };
        }

        setData({
          characterPool,
          supportPool,
          currentBanners,
          loading: false,
          error: null,
          isLive: true,
        });
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Uma Sync Failed, using bootstrap:", err);
        // Sync failed, already initialized with BOOTSTRAP_CHARACTERS etc.
        setData(prev => ({ 
          ...prev, 
          loading: false, 
          isLive: false,
          error: "Live synchronization unavailable. Utilizing localized bootstrap library." 
        }));
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  return data;
}
