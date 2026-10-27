import type { ResultReport } from '@/features/results/services/result-report';
import { theme } from '@/shared/theme';
import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { formatDuration } from '@/features/results/services/result-report';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

function createReportHtml(report: ResultReport) {
  const details = report.details.map((detail) => `
    <tr><td>${escapeHtml(detail.label)}</td><td>${escapeHtml(detail.value)}</td></tr>
  `).join('');

  return `<!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        @page { size: A4; margin: 0; }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 34px 44px 38px; color: ${theme.colors.text}; background: ${theme.colors.white}; font-family: Arial, sans-serif; }
        header { margin: -34px -44px 30px; padding: 20px 44px; color: ${theme.colors.white}; background: ${theme.colors.brand.green}; display: flex; justify-content: space-between; align-items: center; }
        .brand { font-size: 18px; font-weight: 700; }
        .header-label { color: ${theme.colors.reportHeaderTint}; font-size: 8px; letter-spacing: .8px; }
        .intro { margin-bottom: 19px; padding-bottom: 17px; border-bottom: 2px solid ${theme.colors.brand.blue}; }
        h1 { margin: 0; color: ${theme.colors.brand.green}; font-size: 24px; line-height: 1.2; }
        .intro-copy { margin: 6px 0 0; color: ${theme.colors.muted}; font-size: 10px; }
        .identity { margin-bottom: 20px; padding: 12px 14px; background: ${theme.colors.background}; border-left: 3px solid ${theme.colors.brand.green}; }
        .section-label { color: ${theme.colors.brand.blue}; font-size: 8px; font-weight: 700; letter-spacing: .8px; }
        .name { margin: 6px 0 0; color: ${theme.colors.text}; font-size: 14px; font-weight: 700; }
        .metrics { display: flex; margin-bottom: 22px; padding: 12px 0; border-top: 1px solid ${theme.colors.border}; border-bottom: 1px solid ${theme.colors.border}; }
        .metric { flex: 1; min-height: 58px; padding: 6px 12px; border-left: 1px solid ${theme.colors.border}; display: flex; flex-direction: column; justify-content: center; }
        .metric:first-child { padding-left: 0; border-left: 0; }
        .metric-label { color: ${theme.colors.muted}; font-size: 8px; font-weight: 700; letter-spacing: .6px; }
        .metric-value { margin-top: 7px; color: ${theme.colors.text}; font-size: 17px; font-weight: 700; }
        .score .metric-label, .score .metric-value { color: ${theme.colors.brand.green}; }
        .score .metric-value { font-size: 18px; }
        .score small { color: ${theme.colors.muted}; font-size: 9px; font-weight: 400; }
        .details-title { margin: 0; color: ${theme.colors.text}; font-size: 12px; font-weight: 700; }
        table { width: 100%; margin-top: 7px; border-collapse: collapse; }
        tr { break-inside: avoid; }
        td { padding: 8px 0; border-bottom: 1px solid ${theme.colors.border}; font-size: 9px; line-height: 1.4; }
        td:first-child { width: 44%; padding-right: 16px; color: ${theme.colors.muted}; }
        td:last-child { color: ${theme.colors.text}; font-weight: 600; }
        footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid ${theme.colors.border}; color: ${theme.colors.muted}; font-size: 8px; line-height: 1.5; }
        footer p { margin: 0 0 5px; }
        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <header><span class="brand">ConsAttentia</span><span class="header-label">RELATÓRIO PESSOAL</span></header>
      <section class="intro"><h1>${escapeHtml(report.testName)}</h1><p class="intro-copy">Resumo do seu desempenho nas atividades de atenção</p></section>
      <section class="identity"><span class="section-label">PREPARADO PARA</span><p class="name">${escapeHtml(report.userName)}</p></section>
      <section class="metrics">
        <div class="metric"><span class="metric-label">TEMPO</span><span class="metric-value">${formatDuration(report.durationSeconds)}</span></div>
        <div class="metric"><span class="metric-label">${escapeHtml((report.attemptsLabel ?? 'Tentativas').toUpperCase())}</span><span class="metric-value">${report.attempts}</span></div>
        <div class="metric score"><span class="metric-label">PONTUAÇÃO FINAL</span><span class="metric-value">${report.score} <small>${escapeHtml(report.scoreLabel)}</small></span></div>
      </section>
      <section><h2 class="details-title">Detalhamento do resultado</h2><table>${details}</table></section>
      <footer><p>Este relatório resume o desempenho registrado neste teste e é destinado ao seu acompanhamento pessoal. Não substitui avaliação profissional.</p><span>Gerado em ${escapeHtml(report.generatedAt)}</span></footer>
    </body>
  </html>`;
}

export async function shareResultPdf(report: ResultReport): Promise<void> {
  const html = createReportHtml(report);

  if (Platform.OS === 'web') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) throw new Error('Permita janelas pop-up para salvar o relatório em PDF.');

    printWindow.onafterprint = () => printWindow.close();
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  if (!uri) throw new Error('O Expo Print não retornou o arquivo PDF.');

  const sharingAvailable = await Sharing.isAvailableAsync().catch(() => false);
  if (!sharingAvailable) {
    await Print.printAsync({ uri });
    return;
  }

  try {
    await Sharing.shareAsync(uri, {
      dialogTitle: `Compartilhar resultado ${report.testName}`,
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    await Print.printAsync({ uri });
  }
}