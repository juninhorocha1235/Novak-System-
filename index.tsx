import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// Informa ao TypeScript que a função videojs está disponível globalmente
declare const videojs: any;

// Interface para segurança de tipo
interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
}

const App: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [playingChannel, setPlayingChannel] = useState<Channel | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null); // Ref para a instância do player video.js

  // Estado do formulário
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [url, setUrl] = useState('');

  // Carrega canais do localStorage na montagem inicial
  useEffect(() => {
    try {
      const storedChannels = localStorage.getItem('iptv-channels');
      if (storedChannels) {
        setChannels(JSON.parse(storedChannels));
      }
    } catch (error) {
      console.error("Falha ao carregar canais do localStorage", error);
    }
  }, []);

  // Salva canais no localStorage sempre que eles mudam
  useEffect(() => {
    try {
      localStorage.setItem('iptv-channels', JSON.stringify(channels));
    } catch (error) {
      console.error("Falha ao salvar canais no localStorage", error);
    }
  }, [channels]);

  // Lida com a inicialização e destruição do player video.js
  useEffect(() => {
    if (playingChannel && videoRef.current) {
      // Se não houver uma instância do player, crie uma
      if (!playerRef.current) {
        const videoElement = videoRef.current;
        const options = {
          autoplay: true,
          controls: true,
          responsive: true,
          fluid: true,
          sources: [{
            src: playingChannel.url,
            type: 'application/x-mpegURL' // Tipo MIME para HLS
          }]
        };

        // Inicializa o player video.js
        playerRef.current = videojs(videoElement, options, () => {
          console.log('Player está pronto');
        });
      } else {
        // Se o player já existe, apenas mude a fonte
        playerRef.current.src({ src: playingChannel.url, type: 'application/x-mpegURL' });
      }
    }

    // Função de limpeza para destruir o player quando o componente desmontar ou o modal fechar
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [playingChannel]);

  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      alert("O Nome do Canal e a URL do Stream são obrigatórios.");
      return;
    }
    const newChannel: Channel = {
      id: Date.now().toString(),
      name: name.trim(),
      logo: logo.trim(),
      url: url.trim(),
    };
    setChannels(prevChannels => [...prevChannels, newChannel]);
    // Limpa o formulário
    setName('');
    setLogo('');
    setUrl('');
  };

  const handleRemoveChannel = (id: string) => {
     if (window.confirm("Tem certeza que deseja remover este canal?")) {
        setChannels(channels.filter(channel => channel.id !== id));
    }
  }

  const handlePlay = (channel: Channel) => {
    setPlayingChannel(channel);
  };

  const handleClosePlayer = () => {
    setPlayingChannel(null); // Isso acionará a função de limpeza do useEffect
  };

  return (
    <div className="container">
      <header>
        <h1>IPTV Player</h1>
      </header>
      
      <main>
        <section className="admin-panel" aria-labelledby="admin-heading">
          <h2 id="admin-heading">Admin: Adicionar Canal</h2>
          <form onSubmit={handleAddChannel}>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome do Canal" required aria-label="Nome do Canal" />
            <input type="url" value={logo} onChange={e => setLogo(e.target.value)} placeholder="URL do Logo (opcional)" aria-label="URL do Logo" />
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL do Stream" required aria-label="URL do Stream" />
            <button type="submit">Adicionar Canal</button>
          </form>
        </section>

        <section className="channel-grid" aria-label="Canais de TV">
          {channels.length === 0 ? (
            <p className="empty-message">Nenhum canal adicionado ainda. Use o painel de administração para adicionar um canal.</p>
          ) : (
            channels.map(channel => (
              <article key={channel.id} className="channel-card" onClick={() => handlePlay(channel)} onKeyDown={(e) => e.key === 'Enter' && handlePlay(channel)} tabIndex={0} role="button" aria-label={`Reproduzir ${channel.name}`}>
                 <button className="remove-btn" onClick={(e) => { e.stopPropagation(); handleRemoveChannel(channel.id) }} aria-label={`Remover ${channel.name}`}>&times;</button>
                <img src={channel.logo || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzU1NSI+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0yMSAzSDNjLTEuMSAwLTIgLjktMiAydjEyYzAgMS4xLjkgMiAyIDJoMThjMS4xIDAgMi0uOSAyLTJWNWMwLTEuMS0uOS0yLTItMnpNNSAxN1Y3aDE0djEwaC0xNHoiLz48L3N2Zz4='} alt={`logo de ${channel.name}`} onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzU1NSI+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0yMSAzSDNjLTEuMSAwLTIgLjktMiAydjEyYzAgMS4xLjkgMiAyIDJoMThjMS4xIDAgMi0uOSAyLTJWNWMwLTEuMS0uOS0yLTItMnpNNSAxN1Y3aDE0djEwaC0xNHoiLz48L3N2Zz4=' }} />
                <h3>{channel.name}</h3>
              </article>
            ))
          )}
        </section>
      </main>

      {playingChannel && (
        <div className="player-modal" role="dialog" aria-modal="true" aria-labelledby="player-title">
           <div className="player-overlay" onClick={handleClosePlayer} aria-hidden="true"></div>
          <div className="player-content">
            <header className="player-header">
                <h2 id="player-title">{playingChannel.name}</h2>
                <button onClick={handleClosePlayer} className="close-btn" aria-label="Fechar player">&times;</button>
            </header>
            <div data-vjs-player>
              <video ref={videoRef} className="video-js" playsInline></video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}