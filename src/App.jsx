import React, { useEffect, useMemo, useState } from 'react';
import AdminDashboard from "./pages/AdminDashboard.jsx";
import {
  Search,
  ShoppingBag,
  Sparkles,
  Clock3,
  SlidersHorizontal,
  Leaf,
  Plus,
  Minus,
  X,
  ArrowUpRight,
  Heart,
  ChevronDown,
  CheckCircle2,
  MapPin,
  History,
  Truck,
  RotateCcw,
} from 'lucide-react';
import OrderHistory from './pages/OrderHistory';
import "./styles.css";
const API_URL = 'http://localhost:8080/api/foods';
const ORDER_URL = 'http://localhost:8080/api/orders';

const CUISINES = [
  'All',
  'Indian',
  'South Indian',
  'Asian',
  'Healthy',
  'Italian',
  'Fast Food',
];

const QUICK_SEARCHES = [
  'Biryani under ₹250',
  'Vegetarian',
  'Spicy chicken',
  'South Indian',
];

function parseIntent(text) {
  const query = text.toLowerCase();

  const budgetMatch = query.match(
    /(?:under|below|less than|budget(?: of)?)\s*(?:₹|rs\.?|rupees?)?\s*(\d+)|(?:₹|rs\.?|rupees?)\s*(\d+)/i
  );

  const timeMatch = query.match(
    /(?:within|under|in|less than)\s+(\d+)\s*(?:minutes?|mins?)/i
  );

  let cuisine = null;

  if (/south indian|dosa|idli|uttapam/.test(query)) {
    cuisine = 'South Indian';
  } else if (/italian|pasta|pizza/.test(query)) {
    cuisine = 'Italian';
  } else if (/asian|chinese|noodles|rice bowl/.test(query)) {
    cuisine = 'Asian';
  } else if (/healthy|salad|buddha bowl/.test(query)) {
    cuisine = 'Healthy';
  } else if (/burger|fast food/.test(query)) {
    cuisine = 'Fast Food';
  } else if (/indian|paneer|tikka|biryani|wrap/.test(query)) {
    cuisine = 'Indian';
  }

  return {
    budget: budgetMatch
      ? Number(budgetMatch[1] || budgetMatch[2])
      : null,
    time: timeMatch
      ? Number(timeMatch[1])
      : /\bquick\b|\bfast\b/.test(query)
        ? 30
        : null,
    veg: /\bvegetarian\b|\bveg\b|no meat/.test(query),
    nonveg:
      /non[- ]?veg|\bchicken\b|\bmeat\b|\bmutton\b|\bfish\b/.test(query) &&
      !/no meat/.test(query),
    spicy: /\bspicy\b|\bhot\b/.test(query),
    cuisine,
  };
}

function normalizeCuisine(category = '') {
  const value = category.toLowerCase();

  if (value.includes('south indian')) return 'South Indian';
  if (value.includes('chinese') || value.includes('asian')) return 'Asian';
  if (value.includes('italian') || value.includes('pizza') || value.includes('pasta')) {
    return 'Italian';
  }
  if (value.includes('healthy') || value.includes('salad')) return 'Healthy';
  if (value.includes('burger') || value.includes('fast food')) return 'Fast Food';
  if (
    value.includes('indian') ||
    value.includes('biryani') ||
    value.includes('north indian')
  ) {
    return 'Indian';
  }

  return category || 'Other';
}

function isVegetarian(food) {
  return !/chicken|meat|fish|egg|mutton|prawn|pork|bacon|seafood/i.test(
    food.name || ''
  );
}

function readBasket() {
  try {
    return JSON.parse(localStorage.getItem('craveverse-basket') || '{}');
  } catch {
    return {};
  }
}

export default function App() {
  const [meals, setMeals] = useState([]);
  const [customer, setCustomer] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('craveverse-customer')) || null;
  } catch {
    return null;
  }
});

const [showAuth, setShowAuth] = useState(false);
const [authMode, setAuthMode] = useState('login');
const [authLoading, setAuthLoading] = useState(false);
const [authError, setAuthError] = useState('');
const [authSuccess, setAuthSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [intent, setIntent] = useState('');
  const [searchText, setSearchText] = useState('');
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [budget, setBudget] = useState(1000);
  const [maxTime, setMaxTime] = useState(45);
  const [vegetarian, setVegetarian] = useState(false);
  const [activeCuisine, setActiveCuisine] = useState('All');
  const [basket, setBasket] = useState(readBasket);
  const [notice, setNotice] = useState('');
  const [showBasket, setShowBasket] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
const [lastOrder, setLastOrder] = useState(null);
const [lastOrderItems, setLastOrderItems] = useState([]);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [saved, setSaved] = useState([]);
  const [submittingOrder, setSubmittingOrder] = useState(false);




function getFoodImage(name = '', category = '') {
  const food = `${name} ${category}`.toLowerCase();

  const imageMap = [
    // Rice dishes
    {
      keywords: ['egg fried rice'],
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['veg fried rice', 'vegetable fried rice'],
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['gobi manchurian', 'manchurian'],
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['veg pulao', 'pulao'],
      image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['biryani'],
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['fried rice'],
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop',
    },

    // South Indian dishes
    {
      keywords: ['idli sambar', 'sambar idli'],
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['masala dosa', 'mysore dosa', 'plain dosa', 'dosa'],
      image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['idli'],
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['vada', 'uttapam'],
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop',
    },

    // Other Indian dishes
    {
      keywords: ['dal tadka', 'dal fry'],
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['paneer tikka', 'paneer butter masala', 'paneer'],
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['butter chicken', 'chicken curry', 'chicken 65', 'chicken tikka', 'tandoori chicken'],
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['naan', 'roti', 'paratha'],
      image: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&auto=format&fit=crop',
    },

    // Popular foods
    {
      keywords: ['pizza'],
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['burger'],
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['noodles'],
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['pasta', 'macaroni', 'lasagna'],
      image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['cake', 'brownie', 'ice cream', 'gulab jamun'],
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['sandwich', 'wrap', 'roll'],
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop',
    },
    {
      keywords: ['fries'],
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop',
    },
  ];

  const match = imageMap.find(item =>
    item.keywords.some(keyword => food.includes(keyword))
  );

  return match?.image ||
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop';
}


  useEffect(() => {
    let active = true;

    async function loadFoods() {
      setLoading(true);
      setApiError('');

      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`Food request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Unexpected food data received from the server.');
        }

        const formattedMeals = data.map((food) => ({
          id: food.id,
          name: food.name || 'Delicious meal',
          restaurant: food.restaurant?.name || 'Local Restaurant',
          price: Number(food.price) || 0,
          time: 30,
          cuisine: normalizeCuisine(food.category),
          category: food.category || '',
          veg: isVegetarian(food),
          spicy: /chilli|spicy|pepper|hot/i.test(
            `${food.name || ''} ${food.description || ''}`
          ),
          tag: 'Fresh pick',
          rating: '4.7',
          image: food.imageUrl || getFoodImage(food.name, food.category),
          desc: food.description || 'Made fresh for your next craving.',
        }));

        if (active) {
          setMeals(formattedMeals);
        }
      } catch (error) {
        console.error('Unable to load food items:', error);

        if (active) {
          setApiError(
            'We could not load the menu. Check that your Spring Boot backend and MySQL are running, then try again.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFoods();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('craveverse-basket', JSON.stringify(basket));
  }, [basket]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(''), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const parsed = useMemo(() => parseIntent(intent), [intent]);

  const effectiveBudget = parsed.budget ?? budget;
  const effectiveTime = parsed.time ?? maxTime;

  const filtered = useMemo(() => {
    const query = `${searchText} ${intent}`
      .trim()
      .toLowerCase();




    return meals.filter((meal) => {
      const matchesText =
        !query ||
        `${meal.name} ${meal.restaurant} ${meal.cuisine} ${meal.category} ${meal.desc}`
          .toLowerCase()
          .includes(query) ||
        // Keep natural-language search useful even if it contains filter words.
        query.split(/\s+/).some((word) =>
          word.length > 2 &&
          ![
            'under',
            'below',
            'less',
            'than',
            'within',
            'minutes',
            'minute',
            'rupees',
            'quick',
            'fast',
            'something',
            'please',
            'find',
            'meal',
            'food',
            'healthy',
            'vegetarian',
            'spicy',
            'chicken',
          ].includes(word) &&
          `${meal.name} ${meal.cuisine} ${meal.desc}`
            .toLowerCase()
            .includes(word)


        );

      const matchesBudget = meal.price <= effectiveBudget;
      const matchesTime = meal.time <= effectiveTime;
      const matchesVeg = !vegetarian && !parsed.veg || meal.veg;
      const matchesNonVeg = !parsed.nonveg || !meal.veg;
      const matchesSpicy = !parsed.spicy || meal.spicy;
      const matchesCuisine =
        activeCuisine === 'All' || meal.cuisine === activeCuisine;

      return (
        matchesText &&
        matchesBudget &&
        matchesTime &&
        matchesVeg &&
        matchesNonVeg &&
        matchesSpicy &&
        matchesCuisine
      );
    });
  }, [
    meals,
    searchText,
    intent,
    effectiveBudget,
    effectiveTime,
    vegetarian,
    parsed,
    activeCuisine,
  ]);

  const basketCount = Object.values(basket).reduce(
    (sum, quantity) => sum + quantity,
    0
  );

  const basketItems = meals.filter((meal) => basket[meal.id] > 0);

  const subtotal = basketItems.reduce(
    (sum, meal) => sum + meal.price * basket[meal.id],
    0
  );


async function handleAuthSubmit(event) {
  event.preventDefault();

  setAuthError('');
  setAuthSuccess('');
  setAuthLoading(true);

  const formData = new FormData(event.currentTarget);

  const payload = {
    email: String(formData.get('email') || '').trim().toLowerCase(),
    password: String(formData.get('password') || ''),
  };

  if (authMode === 'register') {
    payload.name = String(formData.get('name') || '').trim();
  }

  try {
    const endpoint =
      authMode === 'register' ? 'register' : 'login';

  const response = await fetch(
  `http://localhost:8080/api/auth/${endpoint}`,
  {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
  }
);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Authentication failed. Please try again.'
      );
    }

    if (authMode === 'register') {
      setAuthSuccess('Account created! You can now log in.');
      setAuthMode('login');
      return;
    }

    setCustomer({
      customerId: data.customerId,
      name: data.name,
      email: data.email,
    });

    localStorage.setItem(
      'craveverse-customer',
      JSON.stringify({
        customerId: data.customerId,
        name: data.name,
        email: data.email,
      })
    );

    setShowAuth(false);
    setAuthError('');
    setAuthSuccess('');
    setNotice(`Welcome to CraveVerse, ${data.name}!`);
  } catch (error) {
    setAuthError(error.message || 'Unable to connect to the server.');
  } finally {
    setAuthLoading(false);
  }
}


  function add(meal) {
    setBasket((previous) => ({
      ...previous,
      [meal.id]: (previous[meal.id] || 0) + 1,
    }));

    setNotice(`${meal.name} added to your basket.`);
  }

  function changeQty(id, amount) {
    setBasket((previous) => {
      const next = { ...previous };
      const quantity = Math.max(0, (next[id] || 0) + amount);

      if (quantity === 0) {
        delete next[id];
      } else {
        next[id] = quantity;
      }

      return next;
    });
  }

  function removeFromBasket(id) {
    setBasket((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });

    setNotice('Item removed from your basket.');
  }

  function findMeals() {
    if (parsed.budget !== null) setBudget(parsed.budget);
    if (parsed.time !== null) setMaxTime(parsed.time);
    if (parsed.veg) setVegetarian(true);
    if (parsed.cuisine) setActiveCuisine(parsed.cuisine);

    document.getElementById('explore-results')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  function resetFilters() {
    setIntent('');
    setSearchText('');
    setBudget(1000);
    setMaxTime(45);
    setVegetarian(false);
    setActiveCuisine('All');
  }

  function toggleSave(id) {
    setSaved((previous) =>
      previous.includes(id)
        ? previous.filter((savedId) => savedId !== id)
        : [...previous, id]
    );
  }

  async function submitOrder(event) {
    event.preventDefault();

    if (basketCount === 0) {
      setNotice('Add a meal to your basket before checking out.');
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const orderItems = basketItems.map((meal) => ({
  id: meal.id,
  name: meal.name,
  price: meal.price,
  quantity: basket[meal.id],
}));

    const order = {
  customerName: formData.get('customerName'),
  phone: formData.get('phone'),
  address: formData.get('address'),
  items: basketItems.map((meal) => ({
    foodId: meal.id,
    quantity: basket[meal.id],
  })),
};

    setSubmittingOrder(true);

    try {

const response = await fetch(ORDER_URL, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(order),
});


      if (!response.ok) {
        throw new Error(`Order request failed: ${response.status}`);
      }
const createdOrder = await response.json();

console.log('Created order:', createdOrder);

setLastOrder(createdOrder);
setLastOrderItems(orderItems);

setBasket({});
setShowCheckout(false);
setShowBasket(false);
setShowOrderHistory(false);
setShowAdminDashboard(false);
setShowOrderConfirmation(true);

setNotice('');

if (createdOrder.id != null) {
  setNotice(`Order #${createdOrder.id} placed successfully!`);
} else {
  setNotice('Order placed successfully! Check My Orders for your order ID.');
}

    } catch (error) {
      console.error('Order submission error:', error);
      setNotice('Could not place your order. Check the backend and try again.');
    } finally {
      setSubmittingOrder(false);
    }
  }

  return (
    <div className="app-shell" id="home">
      <header className="topbar">
    <a
  className="brand"
  href="#home"
  onClick={() => {
    setShowAdminDashboard(false);
    setShowOrderHistory(false);
  }}
  aria-label="CraveVerse home"
>
          <span className="brand-mark">c<span>.</span></span>
          <span>crave<span className="brand-accent">verse</span></span>
        </a>

         <nav className="main-nav" aria-label="Main navigation">
  <a
    href="#home"
    className={
      !showOrderHistory && !showAdminDashboard ? 'nav-active' : ''
    }
    onClick={() => {
      setShowAdminDashboard(false);
      setShowOrderHistory(false);
    }}
  >
    Home
  </a>

  <a
    href="#explore"
    onClick={() => {
      setShowAdminDashboard(false);
      setShowOrderHistory(false);
    }}
  >
    Explore menu
  </a>

  <a
    href="#how"
    onClick={() => {
      setShowAdminDashboard(false);
      setShowOrderHistory(false);
    }}
  >
    Our approach
  </a>

  <button
    type="button"
    className={`nav-link-button ${
      showOrderHistory ? 'nav-active' : ''
    }`}
    onClick={() => {
      setShowAdminDashboard(false);
      setShowOrderHistory(true);
    }}
  >
    My orders
  </button>

  <button
    type="button"
    className={`nav-link-button ${
      showAdminDashboard ? 'nav-active' : ''
    }`}
    onClick={() => {
      setShowAdminDashboard(true);
      setShowOrderHistory(false);
    }}
  >
    Admin
  </button>
</nav>



        <div className="top-actions">
          {customer ? (
  <div className="customer-account">
    <span>Hi, {customer.name}</span>
    <button
  type="button"
  onClick={async () => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/auth/logout',
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Logout request failed.');
      }

      setCustomer(null);
      localStorage.removeItem('craveverse-customer');
      setNotice('You have logged out.');
    } catch (error) {
      console.error('Logout failed:', error);
      setNotice('Could not log out. Please try again.');
    }
  }}
>
  Logout
</button>
  </div>
) : (
  <button
    type="button"
    className="auth-open-button"
    onClick={() => {
      setAuthMode('login');
      setAuthError('');
      setAuthSuccess('');
      setShowAuth(true);
    }}
  >
    Login / Register
  </button>
)}
          <div className="location-pill">
            <MapPin size={15} />
            <span>Delivering to <b>BTM Layout</b></span>
            <ChevronDown size={14} />
          </div>

          <button
            className="basket-button"
            onClick={() => setShowBasket(true)}
            aria-label={`Open basket with ${basketCount} items`}
          >
            <ShoppingBag size={18} />
            <span>Basket</span>
            <b>{basketCount}</b>
          </button>
        </div>
      </header>

{showOrderConfirmation ? (
  <main className="confirmation-page">
    <section className="confirmation-card">
      <div className="confirmation-success-icon">✓</div>

      <p className="confirmation-eyebrow">CRAVEVERSE</p>
      <h1>Order Confirmed!</h1>

      <p className="confirmation-subtitle">
        Your delicious meal is on its way!
      </p>

      <div className="confirmation-order-id">
        <span>YOUR ORDER NUMBER</span>
        <strong>#{lastOrder?.id ?? 'Unavailable'}</strong>
        <span className="confirmation-status">
          {lastOrder?.status || 'PLACED'}
        </span>
      </div>

      <div className="confirmation-items">
        <h2>Order Summary</h2>

        {lastOrderItems.map((item, index) => (
          <div
            className="confirmation-item"
            key={item.id ?? index}
          >
            <div>
              <p>{item.name}</p>
              <span>
                ₹{Number(item.price).toFixed(2)} × {item.quantity}
              </span>
            </div>

            <strong>
              ₹{(Number(item.price) * item.quantity).toFixed(2)}
            </strong>
          </div>
        ))}

        <div className="confirmation-total">
  <span>Total</span>
  <strong>
    ₹
    {lastOrderItems
      .reduce(
        (sum, item) =>
          sum + Number(item.price) * Number(item.quantity),
        0
      )
      .toFixed(2)}
  </strong>
</div>
      </div>

      <div className="confirmation-actions">
        <button
          type="button"
          className="confirmation-primary"
          onClick={() => {
            setShowOrderConfirmation(false);
            setShowOrderHistory(true);
          }}
        >
          Track My Order →
        </button>

        <button
          type="button"
          className="confirmation-secondary"
          onClick={() => {
            setShowOrderConfirmation(false);
            setShowOrderHistory(false);
            setShowAdminDashboard(false);
          }}
        >
          Continue Shopping
        </button>
      </div>
    </section>
  </main>
) : showAdminDashboard ? (
  <main className="orders-page">
    <AdminDashboard
      onBack={() => {
        setShowAdminDashboard(false);
        setShowOrderHistory(false);
      }}
    />
  </main>
) : showOrderHistory ? (
  <main className="orders-page">
    <button
      className="back-to-menu"
      onClick={() => setShowOrderHistory(false)}
    >
      ← Back to the menu
    </button>
    <OrderHistory />
  </main>
) : (
        <main>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">
                <Sparkles size={15} />
                GOOD FOOD, WITHOUT THE GUESSWORK
              </div>

              <h1>
                Find your<br />
                next <em>favourite.</em>
              </h1>

              <p className="hero-lede">
                Tell us what you’re craving, how much you want to spend,
                or how soon you need it. We’ll help you narrow the choices.
              </p>

              <form
                className="hero-search"
                onSubmit={(event) => {
                  event.preventDefault();
                  setIntent('');
                  document.getElementById('explore-results')?.scrollIntoView({
                    behavior: 'smooth',
                  });
                }}
              >
                <Search size={19} />
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search biryani, pizza, dosa..."
                  aria-label="Search food"
                />
                {searchText && (
                  <button
                    type="button"
                    className="clear-search"
                    onClick={() => setSearchText('')}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
                <button type="submit" className="search-submit">
                  Search
                </button>
              </form>

              <div className="hero-proof">
                <span><CheckCircle2 size={15} /> Clear prices</span>
                <span><CheckCircle2 size={15} /> Easy ordering</span>
                <span><CheckCircle2 size={15} /> Your choice, your way</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image">
                <img
                  src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85"
                  alt="Freshly prepared colourful meal"
                />
                <div className="image-label">
                  <span className="label-spark"><Sparkles size={15} /></span>
                  <span>
                    <b>Made for your moment</b>
                    <small>Something good is on the menu</small>
                  </span>
                </div>
              </div>

              <div className="floating-note">
                <span className="note-icon"><Clock3 size={18} /></span>
                <span>
                  <b>Short on time?</b>
                  <small>Filter by preparation time.</small>
                </span>
              </div>
              <div className="hero-orbit orbit-one" />
              <div className="hero-orbit orbit-two" />
            </div>
          </section>



          <section className="results-section" id="explore-results">
            <div className="results-heading">
              <div>
                <span className="section-kicker">GOOD THINGS ARE ON THE MENU</span>
                <h2>Find something delicious <span className="sun">✳</span></h2>
                <p className="results-sub">
                  Simple choices, transparent prices, and no endless scrolling.
                </p>
              </div>

              <div className="results-count">
                <b>{filtered.length.toString().padStart(2, '0')}</b>
                <span>matching<br />dishes</span>
              </div>
            </div>

            <div className="cuisine-tabs" aria-label="Filter by cuisine">
              {CUISINES.map((cuisine) => (
                <button
                  key={cuisine}
                  type="button"
                  onClick={() => setActiveCuisine(cuisine)}
                  className={activeCuisine === cuisine ? 'selected' : ''}
                  aria-pressed={activeCuisine === cuisine}
                >
                  {cuisine}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="empty-state loading-state">
                <span><Sparkles size={25} /></span>
                <h3>Preparing your menu</h3>
                <p>Fetching the latest dishes from CraveVerse Kitchen…</p>
              </div>
            ) : apiError ? (
              <div className="empty-state error-state">
                <span><ShoppingBag size={25} /></span>
                <h3>Menu temporarily unavailable</h3>
                <p>{apiError}</p>
                <button onClick={() => window.location.reload()} type="button">
                  Try again
                </button>
              </div>
            ) : filtered.length ? (
              <div className="meal-grid">
                {filtered.map((meal, index) => (
                  <article
                    className="meal-card"
                    key={meal.id}
                    style={{ '--delay': `${Math.min(index * 45, 400)}ms` }}
                  >
                    <div className="meal-photo">
                     <img
  src={meal.image}
  alt={meal.name}
  loading="lazy"
  onError={(event) => {
    console.error(
      `Image failed for ${meal.name}:`,
      meal.image
    );
    event.currentTarget.onerror = null;
    event.currentTarget.src =
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop';
  }}
/>
                      <span className="meal-tag">{meal.tag}</span>
                      <button
                        className={`save-button ${saved.includes(meal.id) ? 'saved' : ''}`}
                        onClick={() => toggleSave(meal.id)}
                        aria-label={saved.includes(meal.id) ? 'Unsave meal' : 'Save meal'}
                        type="button"
                      >
                        <Heart
                          size={17}
                          fill={saved.includes(meal.id) ? 'currentColor' : 'none'}
                        />
                      </button>
                      <span className="photo-time">
                        <Clock3 size={13} /> {meal.time} min*
                      </span>
                    </div>

                    <div className="meal-content">
                      <div className="meal-title-row">
                        <div>
                          <h3>{meal.name}</h3>
                          <p>{meal.restaurant}</p>
                        </div>
                        <span className="rating">★ {meal.rating}</span>
                      </div>

                      <p className="meal-desc">{meal.desc}</p>

                      <div className="meal-bottom">
                        <div className="meal-price">
                          <b>₹{meal.price}</b>
                          <span>
                            {meal.veg ? <><Leaf size={12} /> Vegetarian</> : 'Non-vegetarian'}
                          </span>
                        </div>

                        <button
                          className="add-button"
                          onClick={() => add(meal)}
                          type="button"
                        >
                          <Plus size={16} /> Add
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span><Search size={25} /></span>
                <h3>No exact matches yet</h3>
                <p>
                  Try a different search, increase your budget, or clear a filter.
                </p>
                <button onClick={resetFilters} type="button">Show all meals</button>
              </div>
            )}

            <p className="eta-note">
              *Preparation times are menu estimates, not live delivery promises.
            </p>
          </section><section className="intent-section" id="explore">
            <div className="section-heading">
              <div>
                <span className="section-kicker">YOUR CRAVING, YOUR RULES</span>
                <h2>What sounds good today?</h2>
                <p className="section-description">
                  Describe what you want, or use the filters below.
                </p>
              </div>
              <span className="step-label"><span>01</span> Make it yours</span>
            </div>

            <div className="intent-card">
              <div className="intent-input-wrap">
                <Sparkles size={20} />
                <textarea
                  value={intent}
                  onChange={(event) => setIntent(event.target.value)}
                  placeholder="Try “spicy chicken under ₹250” or “vegetarian food ready in 30 minutes”"
                  rows={2}
                  aria-label="Describe your food preferences"
                />
                <button className="find-button" onClick={findMeals} type="button">
                  Find my meal <ArrowUpRight size={17} />
                </button>
              </div>

              <div className="prompt-row">
                <span>Try a quick search</span>
                {QUICK_SEARCHES.map((suggestion) => (
                  <button
                    key={suggestion}
                    className="prompt-chip"
                    onClick={() => {
                      setIntent(suggestion);
                      if (suggestion === 'Vegetarian') setVegetarian(true);
                    }}
                    type="button"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-bar">
              <div className="filter-title">
                <SlidersHorizontal size={17} />
                <span>Refine your menu</span>
              </div>

              <div className="range-filter">
                <label htmlFor="budget">
                  Budget <b>₹{budget}</b>
                </label>
                <input
                  id="budget"
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={budget}
                  onChange={(event) => setBudget(Number(event.target.value))}
                />
              </div>

              <div className="range-filter">
                <label htmlFor="time">
                  Prep time <b>{maxTime} min</b>
                </label>
                <input
                  id="time"
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={maxTime}
                  onChange={(event) => setMaxTime(Number(event.target.value))}
                />
              </div>

              <button
                className={`veg-toggle ${vegetarian ? 'on' : ''}`}
                onClick={() => setVegetarian((value) => !value)}
                type="button"
                aria-pressed={vegetarian}
              >
                <Leaf size={15} />
                <span>Vegetarian</span>
                <span className="toggle-track"><i /></span>
              </button>

              <button className="reset-button" onClick={resetFilters} type="button">
                <RotateCcw size={13} /> Reset
              </button>
            </div>
          </section>

          <section className="how-section" id="how">
            <div className="how-intro">
              <span className="section-kicker">LESS GUESSING. MORE GOOD EATING.</span>
              <h2>Food choices,<br /><em>made lighter.</em></h2>
              <p>
                CraveVerse starts with your real-life needs instead of an endless menu.
              </p>
            </div>

            <div className="how-steps">
              <article>
                <span className="how-num">01</span>
                <span className="how-icon"><Sparkles size={21} /></span>
                <h3>Tell us what matters</h3>
                <p>Search by dish, budget, time, or dietary preference.</p>
              </article>
              <article>
                <span className="how-num">02</span>
                <span className="how-icon"><SlidersHorizontal size={21} /></span>
                <h3>Explore your matches</h3>
                <p>Use filters to narrow the menu to your preferences.</p>
              </article>
              <article>
                <span className="how-num">03</span>
                <span className="how-icon"><CheckCircle2 size={21} /></span>
                <h3>Order with confidence</h3>
                <p>Review your basket and submit your delivery details.</p>
              </article>
            </div>
          </section>

          <section className="orders-strip">
            <div className="orders-icon"><History size={20} /></div>
            <div>
              <h3>Your orders, all in one place.</h3>
              <p>Open My Orders to review your order history.</p>
            </div>
            <button
              className="orders-link"
              onClick={() => setShowOrderHistory(true)}
              type="button"
            >
              My orders <ArrowUpRight size={16} />
            </button>
            <Truck size={23} className="orders-truck" />
          </section>
        </main>
      )}

      <footer>
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark">c<span>.</span></span>
          <span>crave<span className="brand-accent">verse</span></span>
        </a>
        <span>Make room for something delicious.</span>
        <span>© 2026 CraveVerse</span>
      </footer>

      {notice && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} /> {notice}
        </div>
      )}

      {showBasket && (
        <div className="drawer-backdrop" onClick={() => setShowBasket(false)}>
          <aside
            className="basket-drawer"
            onClick={(event) => event.stopPropagation()}
            aria-label="Shopping basket"
          >
            <div className="drawer-head">
              <div>
                <span className="section-kicker">YOUR SELECTION</span>
                <h2>Your basket <span>({basketCount})</span></h2>
              </div>
              <button
                className="close-button"
                onClick={() => setShowBasket(false)}
                aria-label="Close basket"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            {basketCount ? (
              <>
                <div className="basket-items">
                  {basketItems.map((meal) => (
                    <div className="basket-item" key={meal.id}>
         <img
  src={meal.image}
  alt={meal.name}
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src =
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop';
  }}
/>
                      <div className="basket-item-info">
                        <b>{meal.name}</b>
                        <small>{meal.restaurant}</small>
                        <strong>₹{meal.price * basket[meal.id]}</strong>
                      </div>
                      <div className="quantity-control">
                        <button
                          onClick={() => changeQty(meal.id, -1)}
                          aria-label="Decrease quantity"
                          type="button"
                        >
                          <Minus size={13} />
                        </button>
                        <span>{basket[meal.id]}</span>
                        <button
                          onClick={() => changeQty(meal.id, 1)}
                          aria-label="Increase quantity"
                          type="button"
                        >
                          <Plus size={13} />
                        </button>
                        <button
                          onClick={() => removeFromBasket(meal.id)}
                          aria-label={`Remove ${meal.name}`}
                          type="button"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="basket-summary">
                  <div><span>Subtotal</span><b>₹{subtotal}</b></div>
                  <p>Any additional fees will be confirmed by your ordering service.</p>
                  <button
                    className="checkout-button"
                    onClick={() => {
                      setShowBasket(false);
                      setShowCheckout(true);
                    }}
                    type="button"
                  >
                    Continue to checkout <ArrowUpRight size={17} />
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-basket">
                <ShoppingBag size={32} />
                <h3>Your basket is waiting</h3>
                <p>Add something delicious and it will appear here.</p>
                <button
  type="button"
  onClick={() => {
    setShowBasket(false);
    setShowCheckout(false);
    setShowOrderConfirmation(false);
    setShowOrderHistory(false);
    setShowAdminDashboard(false);

    window.setTimeout(() => {
      document.getElementById('explore-results')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }}
>
  Explore Menu →
</button>
              </div>
            )}
          </aside>
        </div>
      )}

      {showCheckout && (
        <div className="drawer-backdrop" onClick={() => setShowCheckout(false)}>
          <aside
            className="basket-drawer checkout-drawer"
            onClick={(event) => event.stopPropagation()}
            aria-label="Checkout"
          >
            <div className="drawer-head">
              <div>
                <span className="section-kicker">ALMOST THERE</span>
                <h2>Delivery details</h2>
              </div>
              <button
                className="close-button"
                onClick={() => setShowCheckout(false)}
                aria-label="Close checkout"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form className="checkout-form" onSubmit={submitOrder}>
              <label>
                Full name
                <input
                  type="text"
                  name="customerName"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Phone number
                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit phone number"
                  autoComplete="tel"
                  pattern="[0-9]{10}"
                  title="Enter a 10-digit phone number"
                  required
                />
              </label>

              <label>
                Delivery address
                <textarea
                  name="address"
                  placeholder="House number, street, area, city and PIN code"
                  autoComplete="street-address"
                  rows={4}
                  required
                />
              </label>

              <div className="basket-summary">
                <div><span>Items subtotal</span><b>₹{subtotal}</b></div>
                <p>Delivery fees will be confirmed by the ordering service.</p>
              </div>

              <button
                type="submit"
                className="checkout-button"
                disabled={submittingOrder}
              >
                {submittingOrder ? 'Submitting order…' : 'Place order'}
                {!submittingOrder && <ArrowUpRight size={17} />}
              </button>
            </form>
          </aside>
        </div>
      )}
      {showAuth && (
  <div
    className="drawer-backdrop"
    onClick={() => setShowAuth(false)}
  >
    <section
      className="basket-drawer auth-drawer"
      onClick={(event) => event.stopPropagation()}
      aria-label="Customer authentication"
    >
      <div className="drawer-head">
        <div>
          <span className="section-kicker">WELCOME TO CRAVEVERSE</span>
          <h2>
            {authMode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
        </div>

        <button
          type="button"
          className="close-button"
          onClick={() => setShowAuth(false)}
          aria-label="Close authentication"
        >
          <X size={20} />
        </button>
      </div>

      <form className="checkout-form" onSubmit={handleAuthSubmit}>
        {authMode === 'register' && (
          <label>
            Full name
            <input
              name="name"
              type="text"
              placeholder="Enter your name"
              autoComplete="name"
              required
            />
          </label>
        )}

        <label>
          Email address
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete={
              authMode === 'login' ? 'current-password' : 'new-password'
            }
            minLength={authMode === 'register' ? 8 : undefined}
            required
          />
        </label>

        {authError && (
          <p className="auth-error" role="alert">
            {authError}
          </p>
        )}

        {authSuccess && (
          <p className="auth-success" role="status">
            {authSuccess}
          </p>
        )}

        <button
          type="submit"
          className="checkout-button"
          disabled={authLoading}
        >
          {authLoading
            ? 'Please wait…'
            : authMode === 'login'
              ? 'Login'
              : 'Create account'}
        </button>

        <p className="auth-switch">
          {authMode === 'login'
            ? "Don't have an account?"
            : 'Already have an account?'}

          {' '}

          <button
            type="button"
            onClick={() => {
              setAuthMode(
                authMode === 'login' ? 'register' : 'login'
              );
              setAuthError('');
              setAuthSuccess('');
            }}
          >
            {authMode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </form>
    </section>
  </div>
)}
    </div>
  );
}