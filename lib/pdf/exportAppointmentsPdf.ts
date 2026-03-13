export function exportAppointmentsPdf(patientName: string, appointments: any[]) {
  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const rows = appointments
    .map(
      (a) => `
    <tr>
      <td>${a.provider || '—'}</td>
      <td>${
        a.datetime
          ? new Date(a.datetime).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })
          : '—'
      }</td>
      <td>${a.repeat || '—'}</td>
      <td>${a.status || 'scheduled'}</td>
    </tr>
  `
    )
    .join('')

  const html = `
    <html>
      <head>
        <title>Appointments — ${patientName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; background: #F8FAFC; color: #0F172A; }
          .header { background: #2563EB; padding: 32px; color: white; }
          .header h1 { font-size: 28px; letter-spacing: -0.5px; }
          .header h2 { font-size: 14px; opacity: 0.82; margin-top: 4px; font-weight: normal; }
          .header h3 { font-size: 16px; margin-top: 12px; color: #DBEAFE; }
          .meta { background: #E0F2FE; padding: 12px 32px; font-size: 12px; color: #0369A1; display: flex; gap: 32px; }
          .content { padding: 32px; }
          .section-title { font-size: 16px; font-weight: bold; color: #0F172A; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; border-radius: 12px; overflow: hidden; }
          th { background: #1D4ED8; color: white; padding: 12px 16px; text-align: left; font-size: 13px; letter-spacing: 0.4px; }
          td { padding: 12px 16px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #0F172A; }
          tr:nth-child(even) td { background: #F8FAFC; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E2E8F0; color: #64748B; font-size: 11px; display: flex; justify-content: space-between; }
          .print-btn { position: fixed; bottom: 24px; right: 24px; background: #2563EB; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; font-family: Arial; }
          @media print { .print-btn { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AuraHealth Patient Portal</h1>
          <h2>Appointment Schedule</h2>
          <h3>${patientName}</h3>
        </div>
        <div class="meta">
          <span>Generated: ${date}</span>
          <span>Total Records: ${appointments.length}</span>
          <span>CONFIDENTIAL</span>
        </div>
        <div class="content">
          <p class="section-title">Appointments</p>
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Date &amp; Time</th>
                <th>Repeat</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                rows.length > 0
                  ? rows
                  : '<tr><td colspan="4" style="text-align:center;color:#64748B;padding:24px;">No appointments on record.</td></tr>'
              }
            </tbody>
          </table>
          <div class="footer">
            <span>AuraHealth Patient Portal</span>
            <span>${patientName}</span>
          </div>
        </div>
        <button class="print-btn" onclick="window.print()">🖨️ Print / Save PDF</button>
      </body>
    </html>
  `

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Appointments_${patientName.replace(/ /g, '_')}.html`
  a.click()
  URL.revokeObjectURL(url)
}