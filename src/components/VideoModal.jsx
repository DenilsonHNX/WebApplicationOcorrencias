import { useEffect, useRef } from 'react';

export default function VideoModal({ video, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Pausar ao fechar
  function handleClose() {
    videoRef.current?.pause();
    onClose();
  }

  const streamUrl = `/api/stream/${video.id}`;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="video-modal"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="video-modal-header">
          <div className="video-modal-title">
            <span>🎬</span>
            <div>
              <div className="video-modal-name">{video.titulo}</div>
              {video.autor?.nome && (
                <div className="video-modal-author">por {video.autor.nome}</div>
              )}
            </div>
          </div>
          <button className="video-modal-close" onClick={handleClose}>✕</button>
        </div>

        {/* Player */}
        <div className="video-modal-player">
          <video
            ref={videoRef}
            src={streamUrl}
            controls
            autoPlay
            style={{ width: '100%', maxHeight: '60vh', background: '#000', display: 'block' }}
          />
        </div>

        {/* Meta */}
        <div className="video-modal-meta">
          {video.descricao && (
            <p className="video-modal-desc">{video.descricao}</p>
          )}
          <div className="video-modal-stats">
            <span>👁 {video.views ?? 0} visualizações</span>
            <span>❤ {video.likes ?? 0} likes</span>
            {video.duracao > 0 && (
              <span>⏱ {Math.floor(video.duracao / 60)}:{String(Math.floor(video.duracao % 60)).padStart(2, '0')}</span>
            )}
            {video.estado && (
              <span className={`badge badge-${video.estado}`}>{video.estado}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
