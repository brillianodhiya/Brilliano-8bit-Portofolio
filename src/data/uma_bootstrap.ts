import { GachaItem } from "@/components/GachaSystem";

export interface BootstrapBanner {
  id: number;
  name: string;
  image: string;
  type: 'character' | 'support';
  featured: string[];
  start: number;
  end: number;
}

export const BOOTSTRAP_CHARACTERS: GachaItem[] = [
  { "id": "113202", "name": "Loves Only You {beyond_dreams}", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/characters/thumb/chara_stand_1132_113202.png", "rarity": "SSR" },
  { "id": "112901", "name": "Almond Eye", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/characters/thumb/chara_stand_1129_112901.png", "rarity": "SSR" },
  { "id": "101003", "name": "Taiki Shuttle Valentine", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/characters/thumb/chara_stand_1010_101003.png", "rarity": "SSR" },
  { "id": "110202", "name": "Sounds of Earth Valentine", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/characters/thumb/chara_stand_1102_110202.png", "rarity": "SSR" },
  { "id": "113701", "name": "Kiseki", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/characters/thumb/chara_stand_1137_113701.png", "rarity": "SSR" },
  { "id": "112402", "name": "Bubble Gum Fellow New Year", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/characters/thumb/chara_stand_1124_112402.png", "rarity": "SSR" },
  { "id": "106302", "name": "Ikuno Dictus New Year", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/characters/thumb/chara_stand_1063_106302.png", "rarity": "SSR" },
  { "id": "107602", "name": "Sakura Laurel New Year", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/characters/thumb/chara_stand_1076_107602.png", "rarity": "SSR" },
  { "id": "113501", "name": "Stay Gold", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/characters/thumb/chara_stand_1135_113501.png", "rarity": "SSR" },
  { "id": "100603", "name": "Oguri Cap Anime Collab", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/characters/thumb/chara_stand_1006_100603.png", "rarity": "SSR" },
  { "id": "104902", "name": "Nakayama Festa Xmas", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/characters/thumb/chara_stand_1049_104902.png", "rarity": "SSR" },
  { "id": "111902", "name": "Dream Journey Xmas", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/characters/thumb/chara_stand_1119_111902.png", "rarity": "SSR" },
  { "id": "100701", "name": "Gold Ship", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/characters/thumb/chara_stand_1007_100701.png", "rarity": "SR" },
  { "id": "105201", "name": "Haru Urara", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/characters/thumb/chara_stand_1052_105201.png", "rarity": "R" },
];

export const BOOTSTRAP_SUPPORTS: GachaItem[] = [
  { "id": "30086", "name": "Narita Top Road", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/supports/support_card_s_30086.png", "rarity": "SSR" },
  { "id": "30087", "name": "Mejiro Bright", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/supports/support_card_s_30087.png", "rarity": "SSR" },
  { "id": "20043", "name": "Special Week", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/supports/support_card_s_20043.png", "rarity": "SR" },
  { "id": "10037", "name": "Air Shakur", "image": "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/supports/support_card_s_10037.png", "rarity": "R" },
];

export const BOOTSTRAP_BANNERS: { character: BootstrapBanner, support: BootstrapBanner } = {
  character: {
    id: 30074,
    name: "Pretty Derby Scout (Live Banners)",
    image: "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/en/gacha/img_bnr_gacha_30074.png",
    type: 'character',
    featured: ["103703", "107702"],
    start: 0,
    end: 0
  },
  support: {
    id: 30075,
    name: "Support Card Gacha (Live Banners)",
    image: "https://images.weserv.nl/?url=https://gametora.com/images/umamusume/en/gacha/img_bnr_gacha_30075.png",
    type: 'support',
    featured: ["30086"],
    start: 0,
    end: 0
  }
};
