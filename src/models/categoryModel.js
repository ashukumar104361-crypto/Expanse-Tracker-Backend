const { supabase, isLiveSupabase } = require('../config/db');

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Food', description: 'Snacks, street food, cafe visits', icon: 'Utensils' },
  { id: 2, name: 'Travel', description: 'Bus, metro, auto, cab, petrol', icon: 'Bus' },
  { id: 3, name: 'Shopping', description: 'Clothes, footwear, personal accessories', icon: 'ShoppingBag' },
  { id: 4, name: 'Entertainment', description: 'Movies, concerts, hangouts, amusement parks', icon: 'Film' },
  { id: 5, name: 'Education', description: 'Books, stationery, tuition, courses', icon: 'BookOpen' },
  { id: 6, name: 'Bills', description: 'Mobile recharge, Wi-Fi share, pocket bills', icon: 'Receipt' },
  { id: 7, name: 'Health', description: 'Medicines, sports, fitness, checkups', icon: 'HeartPulse' },
  { id: 8, name: 'Gaming', description: 'Game purchases, in-game skins, battle passes', icon: 'Gamepad2' },
  { id: 9, name: 'Subscriptions', description: 'Spotify, Netflix, YouTube Premium, Discord', icon: 'Tv' },
  { id: 10, name: 'Other', description: 'Miscellaneous and unexpected spending', icon: 'CircleDollarSign' }
];

const categoryModel = {
  async findAll() {
    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching categories from Supabase:', error.message);
        return DEFAULT_CATEGORIES;
      }
      return data && data.length > 0 ? data : DEFAULT_CATEGORIES;
    }
    return DEFAULT_CATEGORIES;
  },

  async findById(id) {
    const categories = await this.findAll();
    return categories.find((c) => Number(c.id) === Number(id)) || null;
  }
};

module.exports = categoryModel;
