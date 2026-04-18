import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clapperboard, Home, Film, Ticket, User, Loader2, 
  Search, Star, Play, MapPin, Award, X, Heart, 
  CreditCard, ChevronRight, LogOut, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { auth, db } from './lib/firebase';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  setDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";

// --- AI SETUP ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- TYPES ---
type View = 'home' | 'movies' | 'show' | 'seat' | 'payment' | 'ticket' | 'profile' | 'login' | 'scout';

interface Movie {
  id: string;
  title: string;
  poster: string;
  banner: string;
  rating: number;
  genre: string;
  language: string;
  duration: number;
  description: string;
  trailerUrl: string;
  status: 'now_showing' | 'coming_soon' | 'archived';
}

interface CastMember {
  id: string;
  name: string;
  character: string;
  image: string;
}

interface Show {
  id: string;
  movieId: string;
  theaterName: string;
  hallName: string;
  showTime: string;
  showDate: string;
}

interface Booking {
  id: string;
  movieTitle: string;
  showDate: string;
  showTime: string;
  pnr: string;
  seats: string[];
  totalPrice: number;
}

// --- APP COMPONENT ---
export default function App() {
  const [view, setView] = useState<View>('home');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMovieId, setCurrentMovieId] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const navigate = (v: View, params?: any) => {
    if (v === 'show' && params?.id) setCurrentMovieId(params.id);
    if (v === 'ticket' && params) setBookingData(params);
    setView(v);
    window.scrollTo(0, 0);
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('home');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans pb-24">
      {/* NAV BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-3xl">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('home')}>
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg">
            <Clapperboard className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-outfit font-extrabold tracking-tighter text-white">AK THEATERS</h1>
        </div>

        <div className="hidden md:flex gap-4">
          <NavBtn active={view === 'home'} onClick={() => navigate('home')} label="HOME" />
          <NavBtn active={view === 'movies'} onClick={() => navigate('movies')} label="MOVIES" />
          <NavBtn active={view === 'scout'} onClick={() => navigate('scout')} label="AI SCOUT" />
          {user && <NavBtn active={view === 'profile'} onClick={() => navigate('profile')} label="PROFILE" />}
          {!user ? (
            <NavBtn active={view === 'login'} onClick={() => navigate('login')} label="LOGIN" />
          ) : (
            <button onClick={handleLogout} className="text-[10px] uppercase font-black tracking-widest px-4 py-2 hover:text-accent transition-colors">LOGOUT</button>
          )}
        </div>

        <div className="flex gap-4">
          {user ? (
            <div onClick={() => navigate('profile')} className="w-10 h-10 clay-card rounded-full flex items-center justify-center cursor-pointer overflow-hidden border-accent/20">
              <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <button onClick={() => navigate('login')} className="clay-btn px-6 py-2 text-[10px] uppercase font-bold text-accent">Sign In</button>
          )}
        </div>
      </nav>

      {/* CONTENT */}
      <main className="pt-24 max-w-7xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {view === 'home' && <HomeView onSelectMovie={(id) => navigate('show', {id})} />}
          {view === 'movies' && <MoviesView onSelectMovie={(id) => navigate('show', {id})} />}
          {view === 'show' && currentMovieId && (
            <ShowView 
              id={currentMovieId} 
              onBook={() => navigate('seat', {id: currentMovieId})} 
              navigate={navigate}
            />
          )}
          {view === 'seat' && (
            <SeatView 
              selectedSeats={selectedSeats} 
              setSelectedSeats={setSelectedSeats} 
              onProceed={() => navigate('payment')}
            />
          )}
          {view === 'payment' && (
            <PaymentView 
              total={selectedSeats.length * 250} 
              onConfirm={(pnr) => navigate('ticket', {pnr, seats: selectedSeats, movie: 'EPIC CINEMA'})}
              navigate={navigate}
            />
          )}
          {view === 'ticket' && bookingData && (
            <TicketView data={bookingData} onHome={() => navigate('home')} />
          )}
          {view === 'profile' && <ProfileView user={user} onLogout={handleLogout} />}
          {view === 'login' && <LoginView onLogin={handleLogin} />}
          {view === 'scout' && <ScoutView onSelectMovie={(id) => navigate('show', {id})} />}
        </AnimatePresence>
      </main>

      {/* MOBILE NAV */}
      <div className="fixed bottom-6 left-4 right-4 md:hidden z-50">
        <div className="glass py-4 px-8 rounded-full flex justify-between items-center shadow-2xl">
          <MobileNavIcon active={view === 'home'} icon={<Home />} onClick={() => navigate('home')} />
          <MobileNavIcon active={view === 'movies'} icon={<Film />} onClick={() => navigate('movies')} />
          <MobileNavIcon active={view === 'scout'} icon={<Clapperboard />} onClick={() => navigate('scout')} />
          <MobileNavIcon active={view === 'profile'} icon={<User />} onClick={() => navigate('profile')} />
        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function NavBtn({ active, onClick, label }: any) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "text-[10px] uppercase font-black tracking-widest px-4 py-2 transition-colors",
        active ? "text-accent border-b-2 border-accent" : "hover:text-accent opacity-60"
      )}
    >
      {label}
    </button>
  );
}

function MobileNavIcon({ active, icon, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "transition-all duration-300",
        active ? "text-accent scale-125" : "opacity-40"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </button>
  );
}

// --- VIEWS ---

interface Message {
  role: 'user' | 'model';
  text: string;
}

function ScoutView({ onSelectMovie }: { onSelectMovie: (id: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your AI Movie Scout. What's your vibe today? I can find the perfect south indian blockbuster for you." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), { role: 'user', parts: [{ text: userMsg }]}],
        config: {
          systemInstruction: "You are 'AK Movie Scout', an expert on South Indian Cinema (Telugu, Tamil, Kannada, Malayalam). Recommend movies based on user vibes. Always mention at least one movie we definitely have: Kalki 2898 AD, Leo, Devara, or Vikram. Keep it cool and cinematic."
        }
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "Sorry, I'm bit lost in the grid." }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto h-[70vh] flex flex-col gap-6">
       <div className="flex-1 clay-card p-8 bg-black/40 overflow-y-auto space-y-6 no-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
               <div className={cn(
                 "max-w-[80%] p-4 rounded-2xl text-sm italic font-light",
                 m.role === 'user' ? "clay-btn-active rounded-tr-none" : "clay-card rounded-tl-none border-accent/20"
               )}>
                  {m.text}
               </div>
            </div>
          ))}
          {isTyping && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
       </div>

       <div className="clay-card p-2 flex gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your cinematic mood..." 
            className="flex-1 bg-transparent border-none outline-none px-4 text-sm"
          />
          <button onClick={handleSend} className="clay-btn clay-btn-active px-8 py-3 text-[10px] font-black uppercase">Scout ➔</button>
       </div>
    </motion.div>
  );
}

function HomeView({ onSelectMovie }: { onSelectMovie: (id: string) => void }) {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    // Generate mock movies if DB empty, else fetch
    const fetchMovies = async () => {
      const q = query(collection(db, 'movies'), where('status', '==', 'now_showing'));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Movie));
      
      if (list.length === 0) {
        // Seed some data for preview
        const dummy: Movie[] = [
          { id: 'm1', title: 'Kalki 2898 AD', banner: 'https://image.tmdb.org/t/p/original/21pXfE40X0uT8QExdclXv7d9pZ3.jpg', poster: 'https://image.tmdb.org/t/p/original/mKOBd8SlqQHNvPoZkI0Z1sjeoie.jpg', rating: 8.5, genre: 'Sci-Fi', language: 'Telugu', duration: 180, description: 'Set in the year 2898 AD, Bhairava is a bounty hunter with big dreams who crosses paths with a modern-day avatar of Lord Vishnu.', trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', status: 'now_showing' },
          { id: 'm2', title: 'Devara', banner: 'https://image.tmdb.org/t/p/original/j1zH1QY8O2b7bVf45PEn8uM3p7q.jpg', poster: 'https://image.tmdb.org/t/p/original/A1ENw1zTq41wEn3P5oEq302Sntp.jpg', rating: 8.2, genre: 'Action', language: 'Telugu', duration: 175, description: 'An epic coastal saga of power and betrayal.', trailerUrl: 'https://www.youtube.com/embed/Po3jJhK6_fY', status: 'now_showing' },
          { id: 'm3', title: 'Leo', banner: 'https://image.tmdb.org/t/p/original/ts1ZjoBw2r7E1h4ZeqiZpQ2Yn3h.jpg', poster: 'https://image.tmdb.org/t/p/original/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', rating: 8.6, genre: 'Crime/Action', language: 'Tamil', duration: 164, description: 'A mild-mannered cafe owner becomes a local hero, drawing the attention of an old foe.', trailerUrl: 'https://www.youtube.com/embed/Po3jJhK6_fY', status: 'now_showing' },
          { id: 'm4', title: 'Vikram', banner: 'https://image.tmdb.org/t/p/original/7wEqeC6H4UeQn8JbC3zPj9rY24.jpg', poster: 'https://image.tmdb.org/t/p/original/qemO6oNq9a3lZ2T6zB4ZqB2yO2.jpg', rating: 8.8, genre: 'Action/Thriller', language: 'Tamil', duration: 173, description: 'A high-octane action film where a special investigator uncovers a syndicate.', trailerUrl: 'https://www.youtube.com/embed/Po3jJhK6_fY', status: 'now_showing' },
          { id: 'm5', title: 'Pushpa 2', banner: 'https://image.tmdb.org/t/p/original/7c4OqK1z1pU6O0gBqT9G1bU0sB.jpg', poster: 'https://image.tmdb.org/t/p/original/1A7M20R766OOT1s7nStA9wT7zP3.jpg', rating: 8.9, genre: 'Action', language: 'Telugu', duration: 180, description: 'The clash between Pushpa and Shekhawat takes a darker turn.', trailerUrl: 'https://www.youtube.com/embed/Po3jJhK6_fY', status: 'now_showing' },
          { id: 'm6', title: 'Game Changer', banner: 'https://image.tmdb.org/t/p/original/xXfZzR1J6iL1XWJQO1R2M0mR2hS.jpg', poster: 'https://image.tmdb.org/t/p/original/1Q2f2Z2O7zW45oF1qgC1x5J9O5c.jpg', rating: 8.1, genre: 'Political Action', language: 'Telugu', duration: 170, description: 'An IAS officer takes on corrupt politicians.', trailerUrl: 'https://www.youtube.com/embed/Po3jJhK6_fY', status: 'now_showing' }
        ];
        setMovies(dummy);
      } else {
        setMovies(list);
      }
    };
    fetchMovies();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
      {/* HERO */}
      <section className="relative h-[60vh] rounded-[40px] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
        <img src={movies[0]?.banner} className="w-full h-full object-cover" alt="" />
        <div className="absolute bottom-12 left-12 z-20 space-y-4">
          <span className="clay-pill px-4 py-1 text-[8px] font-black uppercase tracking-widest text-accent bg-accent/10 border-accent/20">AK THEATERS PRESENTS</span>
          <h2 className="text-5xl md:text-7xl font-outfit font-black tracking-tighter uppercase italic">{movies[0]?.title}</h2>
          <div className="flex gap-4 pt-4">
            <button onClick={() => onSelectMovie(movies[0]?.id)} className="clay-btn clay-btn-active px-12 py-4 text-xs font-bold uppercase tracking-widest">Book Now</button>
            <button className="clay-btn px-12 py-4 text-xs font-bold uppercase tracking-widest bg-white/10 glass border-white/5">Watch Trailer</button>
          </div>
        </div>
      </section>

      {/* LIST */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h3 className="text-3xl font-outfit font-black tracking-tight uppercase italic underline decoration-accent/40 underline-offset-8">Hot Hits</h3>
            <p className="text-[10px] opacity-40 uppercase tracking-[0.2em] pt-2">Currently Dominating the Screen</p>
          </div>
          <button className="text-accent text-sm font-bold opacity-60 hover:opacity-100">View All ➔</button>
        </div>

        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 px-2">
          {movies.map((m, i) => (
            <motion.div 
              key={m.id} 
              whileHover={{ y: -10 }}
              onClick={() => onSelectMovie(m.id)}
              className="min-w-[200px] clay-card p-2 group cursor-pointer bg-white/[0.02] border-white/5 transition-all"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4">
                <img src={m.poster} className="w-full h-full object-cover" alt="" />
                <div className="absolute top-2 right-2 clay-pill p-2 bg-black/60 backdrop-blur-md">
                   <Star className="w-3 h-3 text-gold fill-gold" />
                </div>
              </div>
              <div className="px-2 pb-2">
                <h4 className="font-bold text-xs uppercase italic truncate">{m.title}</h4>
                <p className="text-[9px] opacity-40 uppercase">{m.genre}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function MoviesView({ onSelectMovie }: { onSelectMovie: (id: string) => void }) {
  const moviePosters = [
    { title: 'Kalki 2898 AD', img: 'https://image.tmdb.org/t/p/w500/mKOBd8SlqQHNvPoZkI0Z1sjeoie.jpg', genre: 'Sci-Fi • Telugu' },
    { title: 'Devara', img: 'https://image.tmdb.org/t/p/w500/A1ENw1zTq41wEn3P5oEq302Sntp.jpg', genre: 'Action • Telugu' },
    { title: 'Leo', img: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', genre: 'Action • Tamil' },
    { title: 'Vikram', img: 'https://image.tmdb.org/t/p/w500/qemO6oNq9a3lZ2T6zB4ZqB2yO2.jpg', genre: 'Thriller • Tamil' },
    { title: 'Pushpa 2', img: 'https://image.tmdb.org/t/p/w500/1A7M20R766OOT1s7nStA9wT7zP3.jpg', genre: 'Action • Telugu' },
    { title: 'Game Changer', img: 'https://image.tmdb.org/t/p/w500/1Q2f2Z2O7zW45oF1qgC1x5J9O5c.jpg', genre: 'Political Action • Telugu' },
    { title: 'Salaar', img: 'https://image.tmdb.org/t/p/w500/ho1VRbbD1R7k7A4R494t5sJ4FXY.jpg', genre: 'Action • Telugu' },
    { title: 'Jailer', img: 'https://image.tmdb.org/t/p/w500/snGWReeE2e9lI8kU9V5l90dhhIt.jpg', genre: 'Action • Tamil' },
    { title: 'RRR', img: 'https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1YPD37AixP.jpg', genre: 'Action/Drama • Telugu' },
    { title: 'KGF 2', img: 'https://image.tmdb.org/t/p/w500/xZNw9xxtwbEf25DhoERZsgs5xHT.jpg', genre: 'Action • Kannada' },
    { title: 'Kantara', img: 'https://image.tmdb.org/t/p/w500/hS4jH103Y7dG755GgXN5f4cE1XW.jpg', genre: 'Action/Drama • Kannada' },
    { title: 'Ponniyin Selvan', img: 'https://image.tmdb.org/t/p/w500/t0f0g2Qh3J9aN1HofhIigTz8E9j.jpg', genre: 'Historical • Tamil' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      <div className="clay-card p-8 flex flex-col md:flex-row gap-6 items-center justify-between bg-black/40">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
          <input type="text" placeholder="Search the Archive..." className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:border-accent outline-none" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
          {['ALL', 'ACTION', 'DRAMA', 'SCI-FI', 'THRILLER'].map((g, i) => (
            <button key={g} className={cn("clay-pill px-6 py-2 text-[10px] font-black tracking-widest", i === 0 ? "clay-btn-active" : "opacity-40")}>{g}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
        {moviePosters.map((m, i) => (
          <div key={i} onClick={() => onSelectMovie('m'+i)} className="clay-card p-2 cursor-pointer hover:border-accent/40 bg-white/[0.01]">
            <img src={m.img} className="aspect-[2/3] rounded-2xl object-cover mb-4" alt={m.title} />
            <div className="p-2">
              <h4 className="font-bold text-[10px] uppercase truncate italic">{m.title}</h4>
              <p className="text-[8px] opacity-30 uppercase">{m.genre}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ShowView({ id, onBook, navigate }: any) {
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    // Fetch from Firestore
    const dummy: Movie = { id, title: 'Kalki 2898 AD', banner: 'https://image.tmdb.org/t/p/original/21pXfE40X0uT8QExdclXv7d9pZ3.jpg', poster: 'https://image.tmdb.org/t/p/original/mKOBd8SlqQHNvPoZkI0Z1sjeoie.jpg', rating: 8.5, genre: 'Sci-Fi', language: 'Telugu', duration: 180, description: 'Set in the year 2898 AD, Bhairava is a bounty hunter with big dreams who crosses paths with a modern-day avatar of Lord Vishnu.', trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', status: 'now_showing' };
    setMovie(dummy);
  }, [id]);

  if (!movie) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-20 pb-20">
      <section className="grid md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-4 lg:col-span-3">
          <div className="clay-card p-2 animate-float">
            <img src={movie.poster} className="w-full rounded-2xl aspect-[2/3] object-cover" alt="" />
          </div>
        </div>
        <div className="md:col-span-8 lg:col-span-9 space-y-8 pt-4">
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <span className="text-accent font-black text-xs uppercase tracking-[0.2em]">NOW SCREENING</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent/40"></span>
              <span className="opacity-40 text-xs font-bold uppercase tracking-[0.1em]">{movie.language} • {movie.duration}m • {movie.genre}</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-outfit font-black tracking-tighter uppercase italic">{movie.title}</h1>
            <div className="flex gap-6 items-center pt-2">
               <div className="flex items-center gap-2 text-gold font-black">
                 <Star className="w-6 h-6 fill-gold" />
                 <span className="text-2xl">{movie.rating}</span>
                 <span className="text-[10px] opacity-40 ml-2 uppercase">(Verified Grid Score)</span>
               </div>
            </div>
          </div>
          <p className="max-w-3xl text-lg leading-relaxed opacity-60 italic font-light">
             {movie.description}
          </p>
          <div className="flex gap-4 pt-6">
            <button onClick={onBook} className="clay-btn clay-btn-active px-16 py-5 text-sm font-black uppercase tracking-widest">Book Your Node</button>
            <button className="clay-btn px-16 py-5 bg-white/10 glass border-white/5 hover:bg-white/20 transition-all font-black text-sm uppercase"><Play className="inline mr-2" /> Trailer</button>
          </div>
        </div>
      </section>

      {/* CAST */}
      <section className="space-y-8">
        <h3 className="text-3xl font-outfit font-black italic tracking-tighter uppercase underline decoration-accent/40">The Vanguard</h3>
        <div className="flex gap-8 overflow-x-auto no-scrollbar pb-4">
           {[
             { name: 'Prabhas', role: 'Bhairava', img: 'https://image.tmdb.org/t/p/w200/7g3Z1R9Z5rZ0Z4c7gX1g4pW5y9z.jpg' },
             { name: 'Deepika', role: 'Sumati', img: 'https://image.tmdb.org/t/p/w200/bAkeTjmCOBc8oDlOulA0Kz8D1jA.jpg' },
             { name: 'Amitabh', role: 'Ashwathama', img: 'https://image.tmdb.org/t/p/w200/4u4c4A7O5c1W1kM2qO4Q6Y2F5u0.jpg' },
             { name: 'Kamal Haasan', role: 'Supreme Yaskin', img: 'https://image.tmdb.org/t/p/w200/y4iGCOpGQn9GMy0h5XUo1t2S8Lp.jpg' },
             { name: 'Dulquer', role: 'Special Appearance', img: 'https://image.tmdb.org/t/p/w200/1sR4rG0u2lD0k4t1oX6u2vT0u1x.jpg' }
           ].map((c, i) => (
             <div key={i} className="min-w-[140px] text-center space-y-3">
                <div className="w-24 h-24 mx-auto clay-card rounded-full overflow-hidden p-1 border-accent/20">
                   <img src={c.img} className="w-full h-full rounded-full object-cover" alt="" />
                </div>
                <div>
                   <h5 className="text-[10px] font-black uppercase italic">{c.name}</h5>
                   <p className="text-[8px] opacity-40 uppercase">{c.role}</p>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* SHOWTIMES */}
      <section id="showtimes" className="space-y-10 border-t border-white/5 pt-20">
         <h3 className="text-4xl font-outfit font-black italic tracking-tighter uppercase underline decoration-accent/40">Select Timeline</h3>
         <div className="grid gap-6">
            {['AK CINEMAS - GUNTUR', 'AK IMAX - HYD', 'AK MULTIPLEX'].map((t, idx) => (
              <div key={t} className="clay-card p-10 flex flex-col lg:flex-row justify-between items-center gap-12 bg-white/[0.01]">
                 <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 clay-pill flex items-center justify-center text-accent bg-accent/10">
                      <MapPin />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black italic uppercase">{t}</h4>
                      <p className="text-xs opacity-40 uppercase font-black tracking-widest">Premium Laser Projection • Atmos 7.1</p>
                    </div>
                 </div>
                 <div className="flex gap-4 flex-wrap justify-center">
                    {['11:00 AM', '02:45 PM', '06:15 PM', '09:30 PM'].map(time => (
                      <button key={time} onClick={onBook} className="clay-pill px-8 py-3 text-xs font-black border border-white/10 hover:border-accent hover:text-accent transition-all uppercase tracking-widest hover:scale-110 active:scale-95">
                        {time}
                      </button>
                    ))}
                 </div>
              </div>
            ))}
         </div>
      </section>
    </motion.div>
  );
}

function SeatView({ selectedSeats, setSelectedSeats, onProceed }: any) {
  const toggleSeat = (id: string) => {
    setSelectedSeats((prev: string[]) => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="pt-10 space-y-20">
      <div className="flex justify-center gap-10">
         <div className="flex items-center gap-2"><div className="w-3 h-3 clay-card rounded"></div><span className="text-[8px] uppercase font-black opacity-40">Available</span></div>
         <div className="flex items-center gap-2"><div className="w-3 h-3 bg-accent rounded"></div><span className="text-[8px] uppercase font-black opacity-40">Selected</span></div>
         <div className="flex items-center gap-2"><div className="w-3 h-3 bg-black/80 rounded opacity-20"></div><span className="text-[8px] uppercase font-black opacity-40">Occupied</span></div>
      </div>

      <div className="text-center space-y-4">
        <div className="w-full h-2 bg-gradient-to-r from-transparent via-accent/40 to-transparent rounded-full max-w-2xl mx-auto shadow-[0_0_20px_rgba(255,78,0,0.2)]"></div>
        <p className="text-[10px] font-black uppercase tracking-[1em] opacity-40">CINEMATIC SCREEN</p>
      </div>

      <div className="flex flex-col items-center gap-3 overflow-x-auto no-scrollbar pb-10">
        {['A','B','C','D','E','F','G'].map(row => (
          <div key={row} className="flex items-center gap-4">
            <span className="w-6 text-[10px] font-black opacity-20">{row}</span>
            <div className="flex gap-2">
              {Array.from({ length: 18 }).map((_, i) => {
                const id = `${row}${i+1}`;
                const isSelected = selectedSeats.includes(id);
                const isSold = i % 15 === 0;
                return (
                  <button 
                    key={id}
                    disabled={isSold}
                    onClick={() => toggleSeat(id)}
                    className={cn(
                      "w-6 h-6 rounded-md transition-all duration-300",
                      isSold ? "bg-black/80 opacity-20" : isSelected ? "bg-accent shadow-[0_0_15px_#FF4E00] scale-110" : "clay-card hover:bg-white/10"
                    )}
                  />
                );
              })}
            </div>
            <span className="w-6 text-[10px] font-black opacity-20">{row}</span>
          </div>
        ))}
      </div>

      <div className="fixed bottom-24 left-0 right-0 z-50 px-4">
        <div className="max-w-4xl mx-auto clay-card p-6 flex justify-between items-center bg-black/80 backdrop-blur-xl border-accent/20">
           <div>
              <p className="text-[10px] font-black uppercase text-accent tracking-widest">{selectedSeats.length} SEATS SELECTED</p>
              <h4 className="text-4xl font-outfit font-black tracking-tighter">₹{selectedSeats.length * 250}.00</h4>
           </div>
           <button onClick={onProceed} className="clay-btn clay-btn-active px-16 py-5 text-xs font-black uppercase tracking-[0.2em] shadow-2xl">Confirm Logic ➔</button>
        </div>
      </div>
    </motion.div>
  );
}

function PaymentView({ total, onConfirm, navigate }: any) {
  const [paying, setPaying] = useState(false);
  
  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      onConfirm('PNR' + Math.random().toString(36).substr(2, 6).toUpperCase());
    }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-20 max-w-lg mx-auto">
       <div className="clay-card p-10 space-y-10 bg-black/80 relative overflow-hidden">
          <CreditCard className="absolute top-0 right-0 w-64 h-64 opacity-5 -mr-10 -mt-10" />
          <div className="space-y-4">
            <h2 className="text-5xl font-outfit font-black italic tracking-tighter uppercase italic">Payment</h2>
            <p className="text-xs opacity-40 uppercase font-black tracking-widest">Gateway active • Amount: ₹{total}</p>
          </div>

          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[9px] uppercase font-black opacity-30">Identity Name</label>
                <input type="text" placeholder="CMD J. DOE" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-accent" />
             </div>
             <div className="space-y-2">
                <label className="text-[9px] uppercase font-black opacity-30">Security Protocol Number</label>
                <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-accent tracking-widest" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[9px] uppercase font-black opacity-30">Expiry</label>
                   <input type="text" placeholder="MM/YY" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none text-center" />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] uppercase font-black opacity-30">CVV</label>
                   <input type="password" placeholder="***" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none text-center" />
                </div>
             </div>
          </div>

          <button onClick={handlePay} disabled={paying} className="clay-btn clay-btn-active w-full py-6 text-xl font-black italic">
            {paying ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : `Commit ₹${total}`}
          </button>
       </div>
    </motion.div>
  );
}

function TicketView({ data, onHome }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="pt-10 max-w-md mx-auto">
        <div className="clay-card bg-accent p-1 pb-4">
           <div className="bg-black rounded-[20px] p-8 space-y-10 relative overflow-hidden">
              <div className="flex justify-between items-start">
                 <div>
                    <h2 className="text-5xl font-outfit font-black tracking-tighter uppercase italic">Boarding</h2>
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">PNR: {data.pnr}</p>
                 </div>
                 <CheckCircle2 className="w-10 h-10 text-accent" />
              </div>

              <div className="space-y-8">
                 <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase opacity-30">Subject</p>
                    <h4 className="text-2xl font-black italic uppercase leading-none">{data.movie}</h4>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                       <p className="text-[8px] font-black uppercase opacity-30">Logic Seats</p>
                       <p className="font-bold text-sm">{data.seats.join(', ')}</p>
                    </div>
                    <div>
                       <p className="text-[8px] font-black uppercase opacity-30">Timestamp</p>
                       <p className="font-bold text-sm">18 OCT • 09:30 PM</p>
                    </div>
                 </div>
              </div>

              <div className="pt-10 border-t border-dashed border-white/10 flex flex-col items-center gap-6">
                 <div className="bg-white p-4 rounded-3xl">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.pnr}`} className="w-40 h-40" alt="" />
                 </div>
                 <p className="text-[9px] font-black uppercase opacity-20 tracking-[1em]">{data.pnr}</p>
              </div>
           </div>
        </div>
        <button onClick={onHome} className="clay-btn clay-btn-active w-full py-5 mt-10 text-xs font-black uppercase tracking-widest shadow-2xl">Return to Logic Base</button>
    </motion.div>
  );
}

function ProfileView({ user, onLogout }: any) {
  const [activeTab, setActiveTab] = useState<'history' | 'settings'>('history');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
       <div className="flex flex-col md:flex-row items-center gap-8 clay-card p-10 bg-black/40">
          <div className="w-32 h-32 clay-card p-1 rounded-full relative overflow-hidden border-accent/40">
             <img src={user?.photoURL || 'https://picsum.photos/seed/user/200/200'} className="w-full h-full rounded-full object-cover" alt="" />
          </div>
          <div className="space-y-4 text-center md:text-left flex-1">
             <h2 className="text-5xl font-outfit font-black tracking-tight">{user?.displayName?.toUpperCase() || 'AGENT ZERO'}</h2>
             <p className="text-xs opacity-40 uppercase font-black tracking-[0.2em]">{user?.email || 'UNVERIFIED@GRID.COM'}</p>
             <div className="flex justify-center md:justify-start gap-2">
                <span className="clay-pill px-4 py-1 text-[8px] font-black uppercase bg-accent/20 border-accent/20 text-accent">TOP TIER OPERATIVE</span>
                <span className="clay-pill px-4 py-1 text-[8px] font-black uppercase">GRID VERIFIED</span>
             </div>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto">
             <div className="text-center md:text-right">
                <p className="text-4xl font-outfit font-black tracking-tighter text-gold">4,820 <Star className="inline w-6 h-6 fill-gold" /></p>
                <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">Archive Points</p>
             </div>
             <button onClick={onLogout} className="clay-btn px-6 py-3 text-xs font-black text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> Terminate Link</button>
          </div>
       </div>

       <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-4">
             <button 
                onClick={() => setActiveTab('history')}
                className={cn("w-full py-4 px-6 text-sm font-black uppercase tracking-widest text-left transition-all", activeTab === 'history' ? "clay-btn-active" : "clay-card hover:border-accent/40")}
             >
                Cinematic History
             </button>
             <button 
                onClick={() => setActiveTab('settings')}
                className={cn("w-full py-4 px-6 text-sm font-black uppercase tracking-widest text-left transition-all", activeTab === 'settings' ? "clay-btn-active" : "clay-card hover:border-accent/40")}
             >
                Account Settings
             </button>
          </div>

          <div className="lg:col-span-9">
             {activeTab === 'history' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="clay-card p-10 space-y-6 bg-white/[0.01]">
                   <h3 className="text-2xl font-outfit font-black italic uppercase underline decoration-accent/40 underline-offset-8">Mission Logs</h3>
                   <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
                      {[
                        { movie: 'KALKI 2898 AD', date: 'TODAY • 09:30 PM', pnr: 'AK789XJ', price: '₹500', poster: 'https://image.tmdb.org/t/p/w500/mKOBd8SlqQHNvPoZkI0Z1sjeoie.jpg', status: 'UPCOMING' },
                        { movie: 'LEO', date: '12 OCT 2023', pnr: 'LKJ92KS', price: '₹750', poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', status: 'COMPLETED' },
                        { movie: 'VIKRAM', date: '05 JUN 2022', pnr: 'PO9WMM1', price: '₹600', poster: 'https://image.tmdb.org/t/p/w500/qemO6oNq9a3lZ2T6zB4ZqB2yO2.jpg', status: 'COMPLETED' },
                        { movie: 'PUSHPA', date: '17 DEC 2021', pnr: 'AM1PK22', price: '₹1200', poster: 'https://image.tmdb.org/t/p/w500/1A7M20R766OOT1s7nStA9wT7zP3.jpg', status: 'COMPLETED' }
                      ].map((b, i) => (
                        <div key={i} className="flex gap-6 items-center bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-accent/40 transition-colors">
                           <img src={b.poster} className="w-16 h-24 object-cover rounded-lg aspect-[2/3]" alt={b.movie} />
                           <div className="flex-1 space-y-2">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <h5 className="text-xl font-outfit font-black italic uppercase leading-none">{b.movie}</h5>
                                    <p className="text-[10px] opacity-40 uppercase tracking-widest pt-1">{b.date}</p>
                                 </div>
                                 <span className={cn("text-[8px] font-black uppercase px-2 py-1 rounded bg-black", b.status === "UPCOMING" ? "text-accent" : "text-white/40")}>{b.status}</span>
                              </div>
                              <div className="flex justify-between items-end border-t border-white/10 pt-2">
                                 <p className="text-xs uppercase font-black tracking-widest">PNR: <span className="text-accent">{b.pnr}</span></p>
                                 <span className="text-sm font-black text-white">{b.price}</span>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
             )}

             {activeTab === 'settings' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="clay-card p-10 space-y-8 bg-white/[0.01]">
                   <h3 className="text-2xl font-outfit font-black italic uppercase underline decoration-accent/40 underline-offset-8">Grid Configuration</h3>
                   
                   <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black opacity-40 tracking-widest">Display Identity</label>
                            <input type="text" defaultValue={user?.displayName || ''} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-accent text-sm" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black opacity-40 tracking-widest">Comm Link (Email)</label>
                            <input type="email" disabled defaultValue={user?.email || ''} className="w-full bg-black/80 border border-white/5 rounded-xl p-4 outline-none text-sm opacity-50 cursor-not-allowed" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black opacity-40 tracking-widest">Local Number</label>
                            <input type="tel" defaultValue={user?.phoneNumber || ''} placeholder="+91 XXXXX XXXXX" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-accent text-sm tracking-widest" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black opacity-40 tracking-widest">Primary Base</label>
                            <input type="text" defaultValue="AK CINEMAS - GUNTUR" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-accent text-sm uppercase" />
                         </div>
                      </div>

                      <div className="pt-8 border-t border-white/10 space-y-6">
                         <h4 className="text-sm uppercase font-black tracking-widest italic opacity-60">Notification Matrix</h4>
                         <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 cursor-pointer hover:border-accent/40 transition-colors">
                               <div className="space-y-1">
                                  <span className="text-sm uppercase font-black">Ticket Alerts</span>
                                  <p className="text-[9px] opacity-40 uppercase tracking-widest">Receive PNR updates via SMS/Email</p>
                               </div>
                               <input type="checkbox" defaultChecked className="w-5 h-5 accent-accent" />
                            </label>
                            <label className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 cursor-pointer hover:border-accent/40 transition-colors">
                               <div className="space-y-1">
                                  <span className="text-sm uppercase font-black">Release Radar</span>
                                  <p className="text-[9px] opacity-40 uppercase tracking-widest">Get notified when blockbusters drop</p>
                               </div>
                               <input type="checkbox" defaultChecked className="w-5 h-5 accent-accent" />
                            </label>
                         </div>
                      </div>
                      
                      <div className="pt-8 text-right">
                         <button className="clay-btn clay-btn-active px-10 py-4 text-xs font-black uppercase tracking-widest shadow-2xl">Update Core Config</button>
                      </div>
                   </div>
                </motion.div>
             )}
          </div>
       </div>
    </motion.div>
  );
}

function LoginView({ onLogin }: { onLogin: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto pt-20">
       <div className="clay-card p-12 text-center space-y-12 bg-black/80 shadow-3xl">
          <div className="space-y-4">
             <div className="w-20 h-20 bg-accent rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(255,78,0,0.4)] animate-float">
                <Clapperboard className="text-white w-10 h-10" />
             </div>
             <h2 className="text-5xl font-outfit font-black tracking-tighter italic uppercase">Identity Grid</h2>
             <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.5em]">Establish Access Protocol</p>
          </div>
          
          <p className="text-sm opacity-60 leading-relaxed font-light italic">
             Authorize your cinematic identity to unlock real-time seat tracking and personalized archive deployments.
          </p>

          <button 
            onClick={onLogin} 
            className="clay-btn clay-btn-active w-full py-5 text-sm font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 group"
          >
             Connect Google Node <ChevronRight className="group-hover:translate-x-2 transition-transform" />
          </button>
       </div>
    </motion.div>
  );
}
