// src/components/chat/ChatWindow.jsx
import { useState } from 'react';
import { useChat } from '../../hooks/useChat';

const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

const Message = ({ msg, isMe }) => (
  <div style={{
    display: 'flex',
    justifyContent: isMe ? 'flex-end' : 'flex-start',
    marginBottom: 8,
  }}>
    <div style={{
      maxWidth: '75%',
      background: isMe ? '#F5C000' : '#242424',
      color: isMe ? '#000' : '#F0F0F0',
      borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
      padding: '8px 12px',
      fontSize: 13,
      lineHeight: 1.5,
    }}>
      {!isMe && (
        <div style={{ fontSize: 11, color: isMe ? '#00000080' : '#888', marginBottom: 3, fontWeight: 500 }}>
          {msg.profiles?.name}
        </div>
      )}
      <div>{msg.content}</div>
      <div style={{ fontSize: 10, color: isMe ? '#00000060' : '#555', marginTop: 3, textAlign: 'right' }}>
        {formatTime(msg.created_at)}
      </div>
    </div>
  </div>
);

export default function ChatWindow({ tripId, otherName, onClose }) {
  const { messages, loading, sending, input, setInput, sendMessage, handleKey, bottomRef, myId } = useChat(tripId);
  const [minimized, setMinimized] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      width: 320,
      background: '#1A1A1A',
      border: '0.5px solid #2a2a2a',
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(0,0,0,.6)',
      zIndex: 900,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'height .2s',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#111',
        borderBottom: minimized ? 'none' : '0.5px solid #2a2a2a',
        cursor: 'pointer',
      }} onClick={() => setMinimized(m => !m)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 0 2px rgba(34,197,94,.2)',
          }} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            Chat con {otherName || 'conductor'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={e => { e.stopPropagation(); setMinimized(m => !m); }}
            style={{
              background: '#1a1a1a', border: '0.5px solid #333',
              borderRadius: 5, color: '#888', fontSize: 13,
              width: 24, height: 24, display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            {minimized ? '↑' : '−'}
          </button>
          <button
            onClick={e => { e.stopPropagation(); onClose?.(); }}
            style={{
              background: '#1a1a1a', border: '0.5px solid #333',
              borderRadius: 5, color: '#888', fontSize: 14,
              width: 24, height: 24, display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Mensajes */}
          <div style={{
            height: 280, overflowY: 'auto',
            padding: '12px 14px',
            display: 'flex', flexDirection: 'column',
          }}>
            {loading && (
              <div style={{ textAlign: 'center', color: '#555', fontSize: 13, marginTop: 16 }}>
                Cargando mensajes...
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                color: '#555', fontSize: 13, gap: 8, textAlign: 'center',
              }}>
                <span style={{ fontSize: 28 }}>💬</span>
                Envía un mensaje al {otherName || 'conductor'}
              </div>
            )}

            {messages.map((msg) => (
              <Message key={msg.id} msg={msg} isMe={msg.sender_id === myId} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            display: 'flex', gap: 8, padding: '10px 14px',
            borderTop: '0.5px solid #2a2a2a', background: '#111',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Escribe un mensaje..."
              disabled={sending}
              style={{
                flex: 1, background: '#1a1a1a',
                border: '0.5px solid #2a2a2a', borderRadius: 8,
                padding: '8px 12px', color: '#F0F0F0',
                fontSize: 13, outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              style={{
                width: 36, height: 36, borderRadius: 8,
                background: input.trim() ? '#F5C000' : '#1a1a1a',
                border: `0.5px solid ${input.trim() ? '#F5C000' : '#2a2a2a'}`,
                color: input.trim() ? '#000' : '#555',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                fontSize: 16, transition: 'all .15s', flexShrink: 0,
              }}
            >
              ➤
            </button>
          </div>
        </>
      )}
    </div>
  );
}
