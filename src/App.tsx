import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  BookOpen, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Code, 
  Plus, 
  History,
  ChevronRight,
  User,
  Bot,
  ShieldAlert,
  Cpu,
  Fingerprint,
  Binary,
  LayoutGrid,
  Menu,
  X
} from 'lucide-react';
import { GozService, Message } from './services/GozService';

interface LedgerEntry {
  id: string;
  timestamp: number;
  action: string;
  pathway: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [showLedger, setShowLedger] = useState(false);
  const [currentPathway, setCurrentPathway] = useState<string>('General');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const gozRef = useRef<GozService | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gozRef.current = new GozService();
    const initial = gozRef.current.resetConversation();
    setMessages([initial]);
    
    const savedLedger = localStorage.getItem('self_trust_ledger');
    if (savedLedger) {
      setLedger(JSON.parse(savedLedger));
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const messageToSend = text || input.trim();
    if (!messageToSend || !gozRef.current || isTyping) return;

    const lastMessage = messages[messages.length - 1];
    const shouldLogEvidence =
      lastMessage?.role === 'model' && Boolean(lastMessage.isMicroAction);

    if (!text) setInput('');

    if (shouldLogEvidence) {
      logWin(messageToSend);
    }
    
    setMessages(prev => [...prev, { role: 'user', text: messageToSend }]);
    setIsTyping(true);

    // Detect pathway selection
    if (messageToSend.startsWith('A)')) setCurrentPathway('Life Audit');
    if (messageToSend.startsWith('B)')) setCurrentPathway('Hidden Payoff');
    if (messageToSend.startsWith('C)')) setCurrentPathway('Neural Simulator');
    if (messageToSend.startsWith('D)')) setCurrentPathway('Trigger Tracer');
    if (messageToSend.startsWith('E)')) setCurrentPathway('Personal Code');

    const response = await gozRef.current.sendMessage(messageToSend);
    setMessages(prev => [...prev, response]);
    setIsTyping(false);
  };

  const logWin = (action: string) => {
    const newEntry: LedgerEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      action,
      pathway: currentPathway
    };
    const updatedLedger = [newEntry, ...ledger];
    setLedger(updatedLedger);
    localStorage.setItem('self_trust_ledger', JSON.stringify(updatedLedger));
  };

  const getPathwayColor = (pathway: string) => {
    switch (pathway) {
      case 'Life Audit': return 'border-pathway-a text-pathway-a bg-pathway-a/5';
      case 'Hidden Payoff': return 'border-pathway-b text-pathway-b bg-pathway-b/5';
      case 'Neural Simulator': return 'border-pathway-c text-pathway-c bg-pathway-c/5';
      case 'Trigger Tracer': return 'border-pathway-d text-pathway-d bg-pathway-d/5';
      case 'Personal Code': return 'border-pathway-e text-pathway-e bg-pathway-e/5';
      default: return 'border-brand-200 text-brand-600 bg-brand-50';
    }
  };

  const getPathwayIcon = (pathway: string, size = 20) => {
    switch (pathway) {
      case 'Life Audit': return <Activity size={size} />;
      case 'Hidden Payoff': return <ShieldAlert size={size} />;
      case 'Neural Simulator': return <Cpu size={size} />;
      case 'Trigger Tracer': return <Fingerprint size={size} />;
      case 'Personal Code': return <Binary size={size} />;
      default: return <ShieldCheck size={size} />;
    }
  };

  const pathways = [
    { id: 'A', name: 'Life Audit', color: 'from-emerald-400 to-teal-600', icon: 'Activity' },
    { id: 'B', name: 'Hidden Payoff', color: 'from-amber-400 to-orange-600', icon: 'ShieldAlert' },
    { id: 'C', name: 'Neural Simulator', color: 'from-blue-400 to-indigo-600', icon: 'Cpu' },
    { id: 'D', name: 'Trigger Tracer', color: 'from-rose-400 to-pink-600', icon: 'Fingerprint' },
    { id: 'E', name: 'Personal Code', color: 'from-violet-400 to-purple-600', icon: 'Binary' },
  ];

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 bg-brand-400 rounded-2xl flex items-center justify-center text-brand-900 shadow-2xl animate-float">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="font-extrabold text-xl tracking-tight text-white">Self-Trust</h1>
          <p className="text-[10px] text-brand-200 font-black uppercase tracking-[0.25em]">Ledger v1.0</p>
        </div>
      </div>

      <nav className="space-y-3 flex-1">
        <button 
          onClick={() => {
            setShowLedger(false);
            setMessages([gozRef.current?.resetConversation()!]);
            setCurrentPathway('General');
            setIsMobileMenuOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 ${!showLedger && messages.length === 1 ? 'bg-brand-400 text-brand-900 shadow-lg shadow-brand-400/20 font-bold' : 'text-brand-200 hover:bg-white/5 font-medium'}`}
        >
          <LayoutGrid size={20} />
          <span>Pathway Hub</span>
        </button>
        <button 
          onClick={() => {
            setShowLedger(false);
            setIsMobileMenuOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 ${!showLedger && messages.length > 1 ? 'bg-brand-400 text-brand-900 shadow-lg shadow-brand-400/20 font-bold' : 'text-brand-200 hover:bg-white/5 font-medium'}`}
        >
          <Zap size={20} />
          <span>Active Session</span>
        </button>
        <button 
          onClick={() => {
            setShowLedger(true);
            setIsMobileMenuOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 ${showLedger ? 'bg-brand-400 text-brand-900 shadow-lg shadow-brand-400/20 font-bold' : 'text-brand-200 hover:bg-white/5 font-medium'}`}
        >
          <History size={20} />
          <span>Evidence History</span>
        </button>
      </nav>

      <div className="mt-auto space-y-5">
        <div className="bg-white/5 rounded-3xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-brand-200 uppercase tracking-widest">Current Pathway</span>
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse-soft ${currentPathway !== 'General' ? 'bg-brand-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]' : 'bg-white/20'}`} />
          </div>
          <p className="text-base font-extrabold text-white">{currentPathway}</p>
        </div>
        
        <div className="bg-gradient-to-br from-brand-400 to-brand-600 rounded-[2rem] p-6 text-brand-900 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <ShieldCheck size={120} />
          </div>
          <p className="text-xs opacity-80 mb-1 font-bold tracking-wide">Total Evidence Logged</p>
          <p className="text-4xl font-black tracking-tighter">{ledger.length}</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-80 bg-black/20 backdrop-blur-2xl border-r border-white/10 p-8">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-4/5 h-full bg-brand-900 border-r border-white/10 p-8 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-brand-200 hover:text-white"
                >
                  <X size={28} />
                </button>
              </div>
              <SidebarContent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-4 md:px-8 bg-black/10 backdrop-blur-xl border-b border-white/10 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-brand-200 hover:text-white bg-white/5 rounded-xl"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-400 rounded-xl flex items-center justify-center text-brand-900 shadow-lg">
                <ShieldCheck size={18} />
              </div>
              <span className="font-black text-base md:text-lg tracking-tight text-white">Self-Trust</span>
            </div>
          </div>
          
          <div className="hidden md:block">
            <h2 className="text-[11px] font-black text-brand-200 uppercase tracking-[0.3em]">
              {showLedger ? 'Evidence History' : 'Pattern Recognition Partner'}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-5">
            <button 
              onClick={() => {
                setShowLedger(false);
                setMessages([gozRef.current?.resetConversation()!]);
                setCurrentPathway('General');
              }}
              className="p-2 md:p-2.5 text-brand-200 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              title="Back to Dashboard"
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setShowLedger(!showLedger)}
              className="p-2 md:p-2.5 text-brand-200 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              {showLedger ? <Zap size={20} /> : <History size={20} />}
            </button>
            <div className="flex items-center gap-2 md:gap-3 bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-2xl border border-white/10 shadow-sm">
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-brand-400 flex items-center justify-center">
                <User size={12} className="text-brand-900" />
              </div>
              <span className="text-[10px] md:text-xs font-black text-white tracking-wide truncate max-w-[60px] md:max-w-none">PRANALI</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!showLedger ? (
              <motion.div 
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col"
              >
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-10 scrollbar-hide"
                >
                  {messages.length === 1 && messages[0].options ? (
                    <div className="min-h-full flex flex-col items-center justify-center max-w-5xl mx-auto py-6 md:py-10">
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8 md:mb-16 px-4"
                      >
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-brand-400 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-brand-900 mx-auto mb-4 md:mb-6 shadow-2xl animate-float">
                          <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-2 md:mb-4">Build Your Evidence</h2>
                        <p className="text-brand-200 text-base md:text-xl font-medium max-w-2xl mx-auto">
                         Track your actions. Log your wins. Build self-trust through real evidence.
                        </p>
                      </motion.div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 w-full px-4">
                        {pathways.map((p, idx) => (
                          <motion.button
                            key={p.id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.05, translateY: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSend(`${p.id}) ${p.name}`)}
                            className="relative group aspect-[4/5] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl"
                          >
                            <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
                            
                            <div className="relative h-full flex flex-col items-center justify-center p-4 md:p-6 text-center">
                              <div className="w-10 h-10 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl flex items-center justify-center text-white mb-3 md:mb-6 border border-white/30 shadow-xl group-hover:scale-110 transition-transform">
                                {getPathwayIcon(p.name, 24)}
                              </div>
                              <span className="text-[8px] md:text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-1">{p.id}</span>
                              <h3 className="text-sm md:text-xl font-black text-white leading-tight">{p.name}</h3>
                              
                              <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-brand-900 shadow-lg">
                                  <ChevronRight size={16} />
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div key={i} className="space-y-4 md:space-y-6">
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'model' ? 'justify-start' : 'justify-end'} items-start gap-3 md:gap-5`}
                        >
                          {msg.role === 'model' && (
                            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-brand-400 flex items-center justify-center text-brand-900 flex-shrink-0 shadow-xl">
                              <Bot size={18} />
                            </div>
                          )}
                          <div className={msg.role === 'model' ? 'chat-bubble-goz' : 'chat-bubble-user'}>
                            <div className="prose prose-invert prose-xs md:prose-sm max-w-none leading-relaxed font-medium text-inherit">
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                            
                          </div>
                        </motion.div>

                        {/* Clickable Options */}
                        {msg.role === 'model' && msg.options && i > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 ml-11 md:ml-16 max-w-2xl">
                            {msg.options.map((option, idx) => {
                              const pathwayName = option.split(') ')[1];
                              const colorClass = getPathwayColor(pathwayName);
                              return (
                                <motion.button
                                  key={idx}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.1 * idx }}
                                  onClick={() => handleSend(option)}
                                  className={`option-button ${colorClass} border-current p-3 md:p-5`}
                                >
                                  <div className="p-2 md:p-2.5 bg-white/10 rounded-lg md:rounded-xl shadow-sm border border-white/10">
                                    {getPathwayIcon(pathwayName, 18)}
                                  </div>
                                  <span className="font-extrabold text-xs md:text-sm tracking-tight">{option}</span>
                                </motion.button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {isTyping && (
                    <div className="flex justify-start items-start gap-3 md:gap-5">
                      <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-brand-400 flex items-center justify-center text-brand-900 flex-shrink-0 shadow-xl">
                        <Bot size={18} />
                      </div>
                      <div className="chat-bubble-goz flex items-center gap-1.5 md:gap-2 py-4 md:py-6">
                        <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-brand-200 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-brand-200 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-brand-200 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-8 bg-black/20 backdrop-blur-md border-t border-white/10">
                  <div className="max-w-4xl mx-auto relative group">
                    <input 
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type your response..."
                      className="w-full bg-white/10 border border-white/20 rounded-[1.5rem] md:rounded-[2rem] py-4 md:py-6 pl-6 md:pl-8 pr-16 md:pr-20 focus:outline-none focus:border-brand-400 transition-all shadow-2xl text-white font-bold placeholder:text-brand-200 text-sm md:text-lg"
                    />
                    <button 
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isTyping}
                      className="absolute right-2.5 md:right-4 top-1/2 -translate-y-1/2 p-2.5 md:p-4 bg-brand-400 text-brand-900 rounded-xl md:rounded-2xl disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-xl hover:bg-brand-300"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="ledger"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full p-4 md:p-10 overflow-y-auto scrollbar-hide"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4">
                    <div>
                      <h3 className="text-2xl md:text-4xl font-black tracking-tighter text-white">Evidence History</h3>
                      <p className="text-brand-200 font-bold mt-1 md:mt-2 text-sm md:text-lg">Your logged proof of self-belief.</p>
                    </div>
                    <button 
                      onClick={() => {
                        const action = prompt("What micro-action did you complete?");
                        if (action) logWin(action);
                      }}
                      className="flex items-center justify-center gap-2 md:gap-3 bg-brand-400 text-brand-900 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black shadow-2xl hover:bg-brand-300 transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
                    >
                      <Plus size={20} />
                      <span>LOG NEW WIN</span>
                    </button>
                  </div>

                  {ledger.length === 0 ? (
                    <div className="text-center py-20 md:py-40 bg-white/5 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-white/10 shadow-inner">
                      <div className="w-20 h-20 md:w-32 md:h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 text-brand-200 animate-float">
                        <BookOpen size={40} />
                      </div>
                      <p className="text-xl md:text-2xl font-black text-white">Your ledger is empty</p>
                      <p className="text-brand-200 mt-2 md:mt-3 max-w-sm mx-auto font-medium text-sm md:text-lg px-4">Complete a session with Goz to start logging evidence of your growth.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                      {ledger.map((entry) => (
                        <motion.div 
                          key={entry.id}
                          layout
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="ledger-item group hover:shadow-xl transition-all border-l-brand-400 p-4 md:p-5"
                        >
                          <div className="flex items-start justify-between mb-3 md:mb-4">
                            <div className="flex items-center gap-3 md:gap-4">
                              <div className={`p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm ${getPathwayColor(entry.pathway)}`}>
                                {getPathwayIcon(entry.pathway, 16)}
                              </div>
                              <span className="text-[9px] md:text-[11px] font-black text-brand-200 uppercase tracking-[0.2em] md:tracking-[0.3em]">
                                {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <span className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-sm ${getPathwayColor(entry.pathway)}`}>
                              {entry.pathway}
                            </span>
                          </div>
                          <p className="text-white font-black text-base md:text-xl leading-tight group-hover:text-brand-400 transition-colors">
                            {entry.action}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
