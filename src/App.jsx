import React  ,{ useMemo, useState } from 'react';
import { Search, ShoppingBag, Sparkles, Clock3, SlidersHorizontal, Leaf, Plus, Minus, X, ArrowUpRight, Heart, ChevronDown, CheckCircle2, MapPin, History, Truck } from 'lucide-react';

const meals = [
  { id: 1, name: 'Paneer Tikka Bowl', restaurant: 'Urban Kitchen', price: 179, time: 25, cuisine: 'Indian', veg: true, tag: 'Comfort pick', rating: '4.8', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=85', desc: 'Smoky paneer, fluffy rice and mint yogurt.' },
  { id: 2, name: 'Masala Dosa', restaurant: 'Madras House', price: 119, time: 20, cuisine: 'South Indian', veg: true, tag: 'Quick & crisp', rating: '4.7', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85', desc: 'Golden dosa with potato masala and chutneys.' },
  { id: 3, name: 'Chicken Rice Bowl', restaurant: 'Fire & Fork', price: 229, time: 35, cuisine: 'Asian', veg: false,spicy:true, tag: 'Protein boost', rating: '4.9', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85', desc: 'Tender chicken, greens and savoury rice.' },
  { id: 4, name: 'Garden Buddha Bowl', restaurant: 'Green Theory', price: 189, time: 28, cuisine: 'Healthy', veg: true, tag: 'Feel-good food', rating: '4.6', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85', desc: 'Fresh greens, grains, crunchy seeds and dressing.' },
  { id: 5, name: 'Classic Veg Burger', restaurant: 'Burger District', price: 149, time: 22, cuisine: 'Fast Food', veg: true, tag: 'Crowd favourite', rating: '4.5', image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=900&q=85', desc: 'Crispy veggie patty, lettuce and house sauce.' },
  { id: 6, name: 'Creamy Mushroom Pasta', restaurant: 'Little Italy', price: 199, time: 32, cuisine: 'Italian', veg: true, tag: 'Slow-down moment', rating: '4.8', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85', desc: 'Creamy sauce, mushrooms and parmesan.' },
  { id: 7, name: 'Chilli Garlic Noodles', restaurant: 'Wok This Way', price: 169, time: 26, cuisine: 'Asian',cuisine: 'Asian', veg: true, spicy: true, veg: true, tag: 'A little kick', rating: '4.6', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=85', desc: 'Wok-tossed noodles with crisp vegetables.' },
  { id: 8, name: 'Chicken Tikka Wrap', restaurant: 'The Roll Room', price: 209, time: 29, cuisine: 'Indian', veg: false,spicy:true,tag: 'Easy to eat', rating: '4.7', image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=900&q=85', desc: 'Tikka, crunchy salad and tangy mint sauce.' },
];

function parseIntent(text) {
  const q = text.toLowerCase();
const budget = q.match(
  /(?:under|below|less than|budget(?: of)?)\s*(?:₹|rs\.?|rupees?)?\s*(\d+)|(?:₹|rs\.?|rupees?)\s*(\d+)/i
);
const time = q.match(
  /(?:within|under|in|less than)\s+(\d+)\s*(?:minutes?|mins?)/
);

const quick = /\bquick\b|\bfast\b/.test(q);
  let cuisine = null;
  if (/south indian|dosa|idli/.test(q)) cuisine = 'South Indian';
  else if (/italian|pasta|pizza/.test(q)) cuisine = 'Italian';
  else if (/asian|chinese|noodles|rice bowl/.test(q)) cuisine = 'Asian';
  else if (/healthy|salad|buddha bowl/.test(q)) cuisine = 'Healthy';
  else if (/burger|fast food/.test(q)) cuisine = 'Fast Food';
  else if (/indian|paneer|tikka|biryani|wrap/.test(q)) cuisine = 'Indian';
  return {
  budget: budget ? Number(budget[1] || budget[2]) : null,
  time: time ? Number(time[1]) : quick ? 30 : null,
  veg: /\bvegetarian\b|\bveg\b|no meat/.test(q),
  nonveg: /non[- ]?veg|\bchicken\b|\bmeat\b/.test(q) && !/no meat/.test(q),
  spicy: /\bspicy\b|\bhot\b/.test(q),
  cuisine
};
}

export default function App() {
  const [intent, setIntent] = useState('');
  const [budget, setBudget] = useState(250);
  const [maxTime, setMaxTime] = useState(45);
  const [vegetarian, setVegetarian] = useState(false);
  const [activeCuisine, setActiveCuisine] = useState('All');
  const [basket, setBasket] = useState({});
  const [notice, setNotice] = useState('');
  const [showBasket, setShowBasket] = useState(false);
  const [saved, setSaved] = useState([]);
  const parsed = useMemo(() => parseIntent(intent), [intent]);
  const effectiveBudget = parsed.budget ?? budget;
  const effectiveTime = parsed.time ?? maxTime;
const filtered = meals.filter(
  m =>
    m.price <= effectiveBudget &&
    m.time <= effectiveTime &&
    (activeCuisine === 'All' ||
      m.cuisine.toLowerCase() === activeCuisine.toLowerCase()) &&
    (!vegetarian || m.veg) &&
    (!parsed.veg || m.veg) &&
    (!parsed.nonveg || !m.veg) &&
    (!parsed.cuisine ||
      m.cuisine.toLowerCase() === parsed.cuisine.toLowerCase()) &&
    (!parsed.spicy || m.spicy === true)
);
  const basketCount = Object.values(basket).reduce((a, b) => a + b, 0);
  const subtotal = meals.reduce((sum, meal) => sum + meal.price * (basket[meal.id] || 0), 0);
  const add = meal => { setBasket(old => ({ ...old, [meal.id]: (old[meal.id] || 0) + 1 })); setNotice(`${meal.name} added to your basket`); window.setTimeout(() => setNotice(''), 2200); };
  const changeQty = (id, amount) => setBasket(old => { const next = { ...old, [id]: Math.max(0, (old[id] || 0) + amount) }; if (!next[id]) delete next[id]; return next; });
const findMeals = () => {
  if (parsed.budget !== null) {
    setBudget(parsed.budget);
  }

  if (parsed.time !== null) {
    setMaxTime(parsed.time);
  }

  if (parsed.veg) {
    setVegetarian(true);
  }

  if (parsed.cuisine) {
    setActiveCuisine(parsed.cuisine);
  }

  if (filtered.length === 0) {
    setNotice("No exact match yet — try a wider budget or time.");
  } else {
    setNotice(`${filtered.length} meal options found for you.`);
  }
};
  const resetFilters = () => { setIntent(''); setBudget(250); setMaxTime(45); setVegetarian(false); setActiveCuisine('All'); };
  const toggleSave = id => setSaved(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#home" aria-label="CraveVerse home"><span className="brand-mark">c<span>.</span></span><span>craveverse</span></a><nav className="main-nav"><a className="nav-active" href="#explore">Explore</a><a href="#how">How it works</a><a href="#orders">My orders</a></nav><div className="top-actions"><button className="location-pill" aria-label="Delivery location"><MapPin size={15}/><span>Delivering to <b>BTM Layout</b></span><ChevronDown size={14}/></button><button className="basket-button" onClick={() => setShowBasket(true)} aria-label={`Open basket, ${basketCount} items`}><ShoppingBag size={18}/><span>Basket</span><b>{basketCount}</b></button></div></header>
    <main id="home"><section className="hero"><div className="hero-copy"><div className="eyebrow"><Sparkles size={15}/> A BETTER WAY TO DECIDE WHAT TO EAT</div><h1>Your craving.<br/><em>Your universe.</em></h1><p className="hero-lede">Tell us what your day looks like. We’ll help you find food that fits your mood, your budget, and your time.</p><div className="hero-proof"><span><span className="proof-dot"/> Choices that make sense</span><span><span className="proof-dot"/> Clear prices</span><span><span className="proof-dot"/> Your taste, your rules</span></div></div><div className="hero-visual"><div className="hero-image"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=90" alt="A colourful bowl of fresh food"/><div className="image-label"><span className="label-spark"><Sparkles size={14}/></span><span><b>Made for your moment</b><small>Not just another menu</small></span></div></div><div className="floating-note"><span className="note-icon"><Clock3 size={17}/></span><span><b>Short on time?</b><small>We’ll find a quick bite.</small></span></div><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/></div></section>
    <section className="intent-section" id="explore"><div className="section-heading"><div><span className="section-kicker">THE INTENT-TO-MEAL ENGINE</span><h2>What are you in the mood for?</h2></div><span className="step-label"><span>01</span> Tell us your situation</span></div><div className="intent-card"><div className="intent-input-wrap"><Sparkles size={19}/><textarea value={intent} onChange={e => setIntent(e.target.value)} placeholder="Try “Something spicy under ₹200, delivered in 30 minutes” or “A healthy vegetarian lunch”…" rows={2}/><button className="find-button" onClick={findMeals}>Find my meal <ArrowUpRight size={17}/></button></div><div className="prompt-row"><span>Need inspiration?</span>{['Quick lunch under ₹180','Healthy vegetarian','Spicy chicken','Italian comfort food'].map(s => <button key={s} className="prompt-chip" onClick={() => setIntent(s)}>{s}</button>)}</div></div>
      <div className="filter-bar"><div className="filter-title"><SlidersHorizontal size={17}/><span>Make it fit</span></div><div className="range-filter"><label htmlFor="budget">Budget <b>₹{budget}</b></label><input id="budget" type="range" min="100" max="400" step="10" value={budget} onChange={e => setBudget(Number(e.target.value))}/></div><div className="range-filter time-filter"><label htmlFor="time">Ready in <b>{maxTime} min</b></label><input id="time" type="range" min="15" max="60" step="5" value={maxTime} onChange={e => setMaxTime(Number(e.target.value))}/></div><button className={`veg-toggle ${vegetarian ? 'on' : ''}`} onClick={() => setVegetarian(!vegetarian)}><Leaf size={15}/><span>Vegetarian</span><span className="toggle-track"><i/></span></button><button className="reset-button" onClick={resetFilters}>Reset</button></div>
    </section>
    <section className="results-section"><div className="results-heading"><div><span className="section-kicker">A LITTLE LESS SCROLLING, A LITTLE MORE SAVORING</span><h2>Your next great meal <span className="sun">✳</span></h2><p className="results-sub">Thoughtful picks for right now. No guesswork required.</p></div><div className="results-count"><b>{filtered.length.toString().padStart(2,'0')}</b><span>matches<br/>for you</span></div></div><div className="cuisine-tabs">{['All','Indian','South Indian','Asian','Healthy','Italian','Fast Food'].map(c => <button key={c} onClick={() => setActiveCuisine(c)} className={activeCuisine === c ? 'selected' : ''}>{c}</button>)}</div>
      {filtered.length ? <div className="meal-grid">{filtered.map((meal, index) => <article className="meal-card" key={meal.id} style={{'--delay': `${index * 55}ms`}}><div className="meal-photo"><img src={meal.image} alt={meal.name} loading="lazy"/><span className="meal-tag">{meal.tag}</span><button className={`save-button ${saved.includes(meal.id) ? 'saved' : ''}`} onClick={() => toggleSave(meal.id)} aria-label={saved.includes(meal.id) ? 'Remove from saved' : 'Save meal'}><Heart size={17} fill={saved.includes(meal.id) ? 'currentColor' : 'none'}/></button><span className="photo-time"><Clock3 size={13}/>{meal.time} min*</span></div><div className="meal-content"><div className="meal-title-row"><div><h3>{meal.name}</h3><p>{meal.restaurant}</p></div><span className="rating">★ {meal.rating}</span></div><p className="meal-desc">{meal.desc}</p><div className="meal-bottom"><div className="meal-price"><b>₹{meal.price}</b><span>{meal.veg ? <><Leaf size={12}/> Veg</> : 'Non-veg'}</span></div><button className="add-button" onClick={() => add(meal)}><Plus size={16}/> Add</button></div></div></article>)}</div> : <div className="empty-state"><span><Search size={25}/></span><h3>No exact matches just yet</h3><p>Try increasing your budget or time, or clear a filter to see more meals.</p><button onClick={resetFilters}>Show all meals</button></div>}
      <p className="eta-note">*Preparation and delivery times are illustrative menu estimates, not live delivery promises.</p>
    </section>
    <section className="how-section" id="how"><div className="how-intro"><span className="section-kicker">LESS GUESSING. MORE GOOD EATING.</span><h2>Food decisions,<br/><em>made lighter.</em></h2><p>CraveVerse starts with your real-life constraints, not an endless list of dishes.</p></div><div className="how-steps"><article><span className="how-num">01</span><span className="how-icon"><Sparkles size={21}/></span><h3>Tell us the situation</h3><p>Budget, time, mood, dietary preferences — just say what matters.</p></article><article><span className="how-num">02</span><span className="how-icon"><SlidersHorizontal size={21}/></span><h3>See relevant choices</h3><p>We narrow the menu using your preferences and the information available.</p></article><article><span className="how-num">03</span><span className="how-icon"><CheckCircle2 size={21}/></span><h3>Choose with confidence</h3><p>Understand the price and estimated time before you add a meal.</p></article></div></section>
    <section className="orders-strip" id="orders"><div className="orders-icon"><History size={20}/></div><div><h3>Your next craving starts here.</h3><p>Your order history and delivery tracking can be connected when the backend is ready.</p></div><span className="coming-soon">FRONTEND PREVIEW</span><Truck size={23} className="orders-truck"/></section>
    </main><footer><a className="brand footer-brand" href="#home"><span className="brand-mark">c<span>.</span></span><span>craveverse</span></a><span>Make room for something delicious.</span><span>© 2026 CraveVerse · Frontend concept</span></footer>
    {notice && <div className="toast"><CheckCircle2 size={17}/>{notice}</div>}
    {showBasket && <div className="drawer-backdrop" onClick={() => setShowBasket(false)}><aside className="basket-drawer" onClick={e => e.stopPropagation()}><div className="drawer-head"><div><span className="section-kicker">YOUR SELECTION</span><h2>Your basket <span>({basketCount})</span></h2></div><button className="close-button" onClick={() => setShowBasket(false)} aria-label="Close basket"><X size={20}/></button></div>{basketCount ? <><div className="basket-items">{meals.filter(m => basket[m.id]).map(m => <div className="basket-item" key={m.id}><img src={m.image} alt=""/><div className="basket-item-info"><b>{m.name}</b><small>{m.restaurant}</small><strong>₹{m.price * basket[m.id]}</strong></div><div className="quantity-control"><button onClick={() => changeQty(m.id,-1)} aria-label="Decrease quantity"><Minus size={13}/></button><span>{basket[m.id]}</span><button onClick={() => changeQty(m.id,1)} aria-label="Increase quantity"><Plus size={13}/></button></div></div>)}</div><div className="basket-summary"><div><span>Subtotal</span><b>₹{subtotal}</b></div><div><span>Delivery fee</span><span>Shown at checkout</span></div><p>Final fees and availability would be confirmed by a connected ordering service.</p><button className="checkout-button" onClick={() => {setNotice('Checkout is a preview — ordering backend is not connected yet.');setShowBasket(false);window.setTimeout(() => setNotice(''),3000)}}>Continue to checkout <ArrowUpRight size={17}/></button></div></> : <div className="empty-basket"><ShoppingBag size={32}/><h3>Your basket is taking a breather</h3><p>Add something delicious and it’ll show up here.</p><button onClick={() => setShowBasket(false)}>Explore meals</button></div>}</aside></div>}
  </div>;
}
