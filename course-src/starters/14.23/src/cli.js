#!/usr/bin/env node
import { calcularMedia } from './calculo.js';
import { formatarNota } from './formatar.js';

const notas = process.argv.slice(2).map(Number);
console.log(formatarNota(calcularMedia(notas)));
