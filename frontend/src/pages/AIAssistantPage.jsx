import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import { useTheme } from '../contexts/ThemeContext';
import { Header } from '../components/Header';
import {
  Sparkles,
  Send,
  ShieldAlert,
  Bot,
  User,
  ArrowRight,
  HelpCircle,
  Dumbbell,
  Utensils,
  Moon,
  Flame,
  Monitor,
  Activity,
  Zap
} from 'lucide-react';

export const AIAssistantPage = () => {
  const { user } = useAuth();
  const { showToast } = useFitness();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Hello ${user?.name?.split(' ')[0] || 'Athlete'}! I am your **Fit Health AI Fitness & Nutrition Advisor**.\n\nI have loaded your active biometric parameters:\n• **Phase**: ${user?.primaryGoal || 'Bulking'} Mode\n• **Target**: ${user?.targetCalories || 2850} kcal / ${user?.targetProtein || 165}g Protein\n\nHow can I optimize your training, nutrition, or recovery today?`,
      category: 'Welcome'
    }
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
    "Why am I feeling tired today?",
    "Give me a high-protein dinner",
    "Create a chest workout for today",
    "Am I eating enough protein?"
  ];

  const handleSend = async (questionText) => {
    const q = (questionText || inputQuestion).trim();
    if (!q) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: q
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await api.askAssistant(q);
      if (res.success) {
        const botMsg = {
          id: Date.now() + 1,
          sender: 'assistant',
          text: res.answer,
          category: res.category,
          disclaimer: res.disclaimer,
          followUps: res.suggestedFollowUps
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      showToast('AI Advisor service unavailable', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Header title="Fit AI Advisor" subtitle="Biometric-aware coaching & recovery intelligence" />

      <div className="page-container" style={{ padding: '16px 20px 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="laptop-sidebar-layout" style={{ gap: '20px', alignItems: 'start' }}>
          
          {/* Left Sidebar: Athlete Biometric Context & Display Intelligence */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Activity size={16} color="var(--primary)" />
                <h4 style={{ fontSize: '13px', fontWeight: 800 }}>Athlete Biometrics Context</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="flex-between" style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Goal Phase</span>
                  <span className={`badge badge-${(user?.primaryGoal || 'Bulking').toLowerCase()}`} style={{ fontSize: '10px' }}>
                    {user?.primaryGoal || 'Bulking'}
                  </span>
                </div>

                <div className="flex-between" style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Calories</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--amber)' }}>
                    {user?.targetCalories || 2850} kcal
                  </span>
                </div>

                <div className="flex-between" style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Protein</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cyan)' }}>
                    {user?.targetProtein || 165}g / day
                  </span>
                </div>

                <div className="flex-between" style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Weight</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                    {user?.weight || 78.5} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Topic Prompts */}
            <div className="card" style={{ padding: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Suggested Topics:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { label: "Optimal rest between sets", icon: Dumbbell },
                  { label: "Pre-workout meal timing", icon: Utensils },
                  { label: "Supplements for muscle recovery", icon: Zap },
                  { label: "How to fix poor REM sleep", icon: Moon }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.label)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <Icon size={12} color="var(--cyan)" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Main Panel: Conversation & Chat Input */}
          <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', minHeight: '560px', width: '100%' }}>
            
            {/* Suggested Quick Prompt Chips */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '12px' }}>
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="chip"
                  style={{
                    fontSize: '11px',
                    padding: '6px 12px',
                    whiteSpace: 'nowrap',
                    background: 'var(--bg-surface)',
                    borderColor: 'rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <Sparkles size={12} color="var(--primary)" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>

            {/* Conversation Stream */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '58vh', paddingRight: '4px' }}>
              {messages.map(msg => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      maxWidth: '85%'
                    }}
                  >
                    {!isUser && (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Bot size={18} color="#000" />
                      </div>
                    )}

                    <div
                      className="card"
                      style={{
                        padding: '12px 16px',
                        background: isUser ? 'linear-gradient(135deg, var(--primary), #059669)' : 'var(--bg-surface)',
                        color: isUser ? '#ffffff' : 'var(--text-primary)',
                        borderColor: isUser ? 'transparent' : 'var(--border-color)',
                        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        fontSize: '13px',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {msg.category && !isUser && (
                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                          {msg.category}
                        </span>
                      )}

                      {msg.text}

                      {msg.followUps && msg.followUps.length > 0 && (
                        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Suggested Questions:</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                            {msg.followUps.map((fu, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSend(fu)}
                                style={{
                                  textAlign: 'left',
                                  fontSize: '11px',
                                  color: 'var(--cyan)',
                                  padding: '2px 0',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  background: 'none',
                                  border: 'none'
                                }}
                              >
                                → {fu}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {msg.disclaimer && (
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                          {msg.disclaimer}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={16} color="var(--primary)" className="spin" />
                  </div>
                  <span>Fit Health AI is analyzing your biometric profile...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}
            >
              <input
                type="text"
                className="form-input"
                placeholder="Ask about workouts, macros, fatigue, form tips..."
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                style={{ fontSize: '13px', height: '44px' }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '46px', height: '44px', padding: 0, flexShrink: 0 }}
                disabled={loading || !inputQuestion.trim()}
              >
                <Send size={18} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
