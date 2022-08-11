import cavaloAudio from "../audio/cavalo.mp3";
import naoAudio from "../audio/nao.mp3";
import eleGostaAudio from "../audio/ele-gosta.mp3";
import queEIssoMeuFilhoCalmaAudio from "../audio/que-isso-meu-filho-calma.mp3";
import tomeAudio from "../audio/tome.mp3";
import uiAudio from "../audio/ui.mp3";
import dancaGatinho from "../audio/dança-gatinho-dança.mp3";

export function getFunnyAudioByMessage(message = "") {
  if (message.includes("cavalo")) return new Audio(cavaloAudio);
  if (message.includes("não")) return new Audio(naoAudio);
  if (message.includes("ele gosta")) return new Audio(eleGostaAudio);
  if (message.includes("que é isso meu filho calma")) return new Audio(queEIssoMeuFilhoCalmaAudio);
  if (message.includes("tome")) return new Audio(tomeAudio);
  if (message.includes("ui")) return new Audio(uiAudio);
  if (message.includes("dança gatinho")) return new Audio(dancaGatinho);

  return null;
}