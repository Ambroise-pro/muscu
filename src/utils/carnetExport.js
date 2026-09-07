import { formatTime } from './format';

export const CARNET_URL = "https://carnetentrainementv2.vercel.app/";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const rpeStyle = (rpe) => {
  if (rpe >= 9) return "color:#b91c1c;font-weight:bold";
  if (rpe >= 7) return "color:#b45309;font-weight:bold";
  return "color:#047857;font-weight:bold";
};

const THEAD_STYLE = "background:linear-gradient(90deg,#4f46e5,#3b82f6);color:#ffffff;padding:6px 8px;text-align:left;border:1px solid #4338ca;font-weight:bold";
const THEAD_STYLE_CENTER = THEAD_STYLE.replace("text-align:left", "text-align:center");
const TD_STYLE = "padding:6px 8px;border:1px solid #e2e8f0";
const TD_STYLE_CENTER = `${TD_STYLE};text-align:center`;

export const buildBilanHtml = (seance) => {
  const dateLabel = new Date(seance.createdAt).toLocaleDateString('fr-FR');
  const rmCalcs = seance.rmCalcs || [];
  const workout = seance.workout;
  const items = workout?.items || [];

  let html = `<h3 style="color:#1d4ed8">Bilan de séance – ${escapeHtml(dateLabel)}</h3>`;

  if (rmCalcs.length > 0) {
    html += `<h4 style="color:#4338ca">Calculs 1RM</h4>`;
    html += `<table style="border-collapse:collapse;width:100%;max-width:600px"><thead><tr>`
      + `<th style="${THEAD_STYLE}">Muscle</th>`
      + `<th style="${THEAD_STYLE}">Exercice</th>`
      + `<th style="${THEAD_STYLE_CENTER}">Charge x Reps</th>`
      + `<th style="${THEAD_STYLE_CENTER}">1RM est.</th>`
      + `</tr></thead><tbody>`;
    rmCalcs.forEach((item, idx) => {
      const bg = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
      html += `<tr style="background-color:${bg}">`
        + `<td style="${TD_STYLE}">${escapeHtml(item.muscle || "-")}</td>`
        + `<td style="${TD_STYLE}">${escapeHtml(item.exercise)}</td>`
        + `<td style="${TD_STYLE_CENTER}">${escapeHtml(item.weightInput)}kg x ${escapeHtml(item.repsInput)}</td>`
        + `<td style="${TD_STYLE_CENTER};font-weight:bold;color:#15803d">${escapeHtml(item.rmResult)}</td>`
        + `</tr>`;
    });
    html += `</tbody></table>`;
  }

  if (items.length > 0) {
    const statusLabel = workout.completedAt
      ? `Entraînement loggé le ${escapeHtml(new Date(workout.completedAt).toLocaleDateString('fr-FR'))}`
      : "Entraînement programmé (pas encore réalisé)";
    html += `<h4 style="color:#4338ca">${statusLabel}</h4>`;

    items.forEach((exo, idx) => {
      const logs = workout.logs ? workout.logs[idx] : null;
      html += `<p><strong style="color:#1d4ed8">${escapeHtml(exo.exercise)}</strong> `
        + `<span style="color:#64748b">(${escapeHtml(exo.muscle || "-")}) — ${escapeHtml(exo.sets)}x${escapeHtml(exo.reps)}${exo.weight ? ` @ ${escapeHtml(exo.weight)}kg` : ""}</span></p>`;

      if (logs && logs.length > 0) {
        html += `<table style="border-collapse:collapse;width:100%;max-width:600px"><thead><tr>`
          + `<th style="background-color:#e0e7ff;color:#3730a3;padding:5px 8px;text-align:center;border:1px solid #c7d2fe;font-weight:bold">Série</th>`
          + `<th style="background-color:#e0e7ff;color:#3730a3;padding:5px 8px;text-align:center;border:1px solid #c7d2fe;font-weight:bold">Effort</th>`
          + `<th style="background-color:#e0e7ff;color:#3730a3;padding:5px 8px;text-align:center;border:1px solid #c7d2fe;font-weight:bold">Repos</th>`
          + `<th style="background-color:#e0e7ff;color:#3730a3;padding:5px 8px;text-align:center;border:1px solid #c7d2fe;font-weight:bold">RPE</th>`
          + `</tr></thead><tbody>`;
        logs.forEach((log, i) => {
          const bg = i % 2 === 0 ? "#f8fafc" : "#ffffff";
          html += `<tr style="background-color:${bg}">`
            + `<td style="${TD_STYLE_CENTER};font-weight:bold">${escapeHtml(log.set)}</td>`
            + `<td style="${TD_STYLE_CENTER}">${escapeHtml(formatTime(log.workTime))}</td>`
            + `<td style="${TD_STYLE_CENTER}">${escapeHtml(formatTime(log.realRestTime))}</td>`
            + `<td style="${TD_STYLE_CENTER};${rpeStyle(log.rpe)}">${escapeHtml(log.rpe)}</td>`
            + `</tr>`;
        });
        html += `</tbody></table>`;
      } else {
        html += `<p style="color:#94a3b8;font-style:italic">Pas encore réalisé.</p>`;
      }
    });
  }

  if (rmCalcs.length === 0 && items.length === 0) {
    html += `<p style="color:#94a3b8;font-style:italic">Aucune donnée pour cette séance.</p>`;
  }

  return html;
};

export const buildBilanText = (seance) => {
  const lines = [`Bilan de séance – ${new Date(seance.createdAt).toLocaleDateString('fr-FR')}`];
  const rmCalcs = seance.rmCalcs || [];
  const workout = seance.workout;
  const items = workout?.items || [];

  if (rmCalcs.length > 0) {
    lines.push('', 'Calculs 1RM :');
    rmCalcs.forEach((item) => {
      lines.push(`- ${item.muscle || '-'} / ${item.exercise} : ${item.weightInput}kg x ${item.repsInput} => ${item.rmResult}kg`);
    });
  }

  if (items.length > 0) {
    lines.push('', workout.completedAt
      ? `Entraînement loggé le ${new Date(workout.completedAt).toLocaleDateString('fr-FR')} :`
      : 'Entraînement programmé :');
    items.forEach((exo, idx) => {
      lines.push(`- ${exo.exercise} (${exo.muscle || '-'}) : ${exo.sets}x${exo.reps}${exo.weight ? ` @ ${exo.weight}kg` : ''}`);
      const logs = workout.logs ? workout.logs[idx] : null;
      if (logs && logs.length > 0) {
        logs.forEach((log) => {
          lines.push(`   Série ${log.set} : effort ${formatTime(log.workTime)}, repos ${formatTime(log.realRestTime)}, RPE ${log.rpe}`);
        });
      }
    });
  }

  return lines.join('\n');
};

// Fiable sur iPad/Safari : écriture synchrone via l'évènement copy, dans le
// même geste utilisateur (pas d'await avant), ce que le clic droit "Coller"
// natif du navigateur sait toujours lire.
const writeViaExecCommand = (html, text) => {
  const handler = (e) => {
    e.clipboardData.setData("text/plain", text);
    e.clipboardData.setData("text/html", `<!--CARNET_RESULTS_V1-->${html}`);
    e.preventDefault();
  };
  document.addEventListener("copy", handler);
  const ok = document.execCommand("copy");
  document.removeEventListener("copy", handler);
  return ok;
};

// Écriture additionnelle via l'API Clipboard asynchrone (ClipboardItem) :
// certains boutons "Coller" applicatifs (dont celui du Carnet) lisent le
// presse-papiers via navigator.clipboard.read() plutôt que via l'évènement
// paste natif. On la tente en plus, sans jamais bloquer/attendre dessus
// (elle est lancée pendant le même geste utilisateur, mais on ne l'awaite
// pas pour ne pas retarder l'ouverture de l'onglet).
const writeViaClipboardApi = (html, text) => {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") return;
  try {
    const item = new ClipboardItem({
      "text/plain": new Blob([text], { type: "text/plain" }),
      "text/html": new Blob([`<!--CARNET_RESULTS_V1-->${html}`], { type: "text/html" })
    });
    navigator.clipboard.write([item]).catch(() => {});
  } catch (e) {
    // ClipboardItem/type non supporté : on ignore, execCommand reste la référence.
  }
};

// Ouvre l'onglet Carnet en tout premier (synchrone, avant toute écriture
// presse-papiers) pour rester dans la fenêtre de tolérance des bloqueurs de
// popup (Safari en particulier annule l'activation utilisateur dès qu'un
// await a eu lieu avant l'appel à window.open).
export const exportBilanToCarnet = (seance) => {
  const newTab = window.open('', '_blank');

  const html = buildBilanHtml(seance);
  const text = buildBilanText(seance);
  const copied = writeViaExecCommand(html, text);
  writeViaClipboardApi(html, text);

  let opened = false;
  if (newTab) {
    try {
      newTab.location.href = CARNET_URL;
      opened = true;
    } catch (e) {
      opened = false;
    }
  }
  if (!opened) {
    opened = !!window.open(CARNET_URL, "_blank");
  }

  return { copied, opened };
};
