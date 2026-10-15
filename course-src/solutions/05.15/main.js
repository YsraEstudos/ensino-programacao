const segmentador = new Intl.Segmenter('pt', { granularity: 'grapheme' });

export function contarGraficos(texto) {
  return Array.from(segmentador.segment(texto)).length;
}
