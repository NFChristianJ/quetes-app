import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

export async function shareStatsCard({ level, streak, rate, avatarIcon, avatarColor, theme }) {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');

  // Fond
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-void').trim() || '#14102B';
  const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim() || '#1E1840';
  const gold = getComputedStyle(document.documentElement).getPropertyValue('--color-gold').trim() || '#E3B54E';
  const parchment = getComputedStyle(document.documentElement).getPropertyValue('--color-parchment').trim() || '#EDE6D6';

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = surface;
  roundRect(ctx, 40, 40, canvas.width - 80, canvas.height - 80, 24);
  ctx.fill();

  // Avatar
  ctx.fillStyle = avatarColor || gold;
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.arc(160, 160, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = avatarColor || gold;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(160, 160, 70, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = '64px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = parchment;
  ctx.fillText(avatarIcon || '🧙', 160, 165);

  // Titre
  ctx.textAlign = 'left';
  ctx.fillStyle = gold;
  ctx.font = 'bold 34px Georgia, serif';
  ctx.fillText('QUÊTES', 280, 120);
  ctx.fillStyle = parchment;
  ctx.font = '20px sans-serif';
  ctx.fillText(`Niveau ${level}`, 280, 160);

  // Stats
  drawStat(ctx, 280, 260, `${streak} j`, 'Meilleure série', parchment, gold);
  drawStat(ctx, 560, 260, `${rate}%`, 'Réussite (14 j)', parchment, gold);

  ctx.fillStyle = parchment;
  ctx.globalAlpha = 0.5;
  ctx.font = '14px sans-serif';
  ctx.fillText('Fait avec Quêtes', 280, 430);
  ctx.globalAlpha = 1;

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

  if (Capacitor.isNativePlatform()) {
    const reader = new FileReader();
    const dataUrl = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    await Share.share({
      title: 'Ma série sur Quêtes',
      url: dataUrl,
      dialogTitle: 'Partager ma série',
    });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ma-serie-quetes.png';
    a.click();
    URL.revokeObjectURL(url);
  }
}

function drawStat(ctx, x, y, value, label, parchment, gold) {
  ctx.textAlign = 'left';
  ctx.fillStyle = gold;
  ctx.font = 'bold 46px sans-serif';
  ctx.fillText(value, x, y);
  ctx.fillStyle = parchment;
  ctx.globalAlpha = 0.7;
  ctx.font = '16px sans-serif';
  ctx.fillText(label, x, y + 30);
  ctx.globalAlpha = 1;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
