/* meme-agent.css - UI pou MEME (endepandan) */
.meme-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff4d4d, #b30000);
  box-shadow: 0 12px 30px rgba(255, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 12000;
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;
  user-select: none;
}

.meme-widget:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 20px 36px rgba(255, 0, 0, 0.25);
}

.meme-avatar {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ffe6e6, #ff4d4d 40%, #cc0000 70%);
  border: 3px solid rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-family: "Poppins", Arial, sans-serif;
  color: #8b0000;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
}

.meme-floating {
  position: absolute;
  left: -12px;
  top: -12px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  font-size: 11px;
}

.meme-bubble {
  position: fixed;
  right: 132px;
  bottom: 40px;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(255, 0, 0, 0.15);
  padding: 12px 14px;
  font-family: "Poppins", Arial, sans-serif;
  color: #8b0000;
  z-index: 12000;
  display: none;
  border: 2px solid rgba(255, 0, 0, 0.08);
}

.meme-bubble.show {
  display: block;
  animation: memeFadeIn 0.22s ease;
}

@keyframes memeFadeIn {
  from {
    transform: translateY(8px) scale(0.98);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.meme-bubble .title {
  font-weight: 700;
  margin-bottom: 6px;
  font-size: 14px;
}

.meme-bubble .msg {
  font-size: 13px;
  line-height: 1.35;
  margin-bottom: 8px;
}

.meme-bubble .controls {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}

.meme-bubble button {
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.meme-bubble button.ok {
  background: #b30000;
  color: #fff;
}

.meme-bubble button.ko {
  background: #fff;
  color: #8b0000;
  border: 1px solid #e6e6e6;
}

.meme-bubble .small {
  font-size: 12px;
  color: #444;
}
