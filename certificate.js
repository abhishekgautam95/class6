export function generateCertificate(state) {
  // Create certificate overlay
  const overlay = document.createElement('div');
  overlay.id = 'certificate-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9); z-index: 1000;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    overflow-y: auto; padding: 20px;
  `;
  
  const certId = 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const badgeHTML = state.badgesEarned.length > 0 
    ? `<div style="font-size: 50px; margin: 10px 0;">${state.badgesEarned[0].icon}</div><div style="font-weight: bold; color: #b026ff;">${state.badgesEarned[0].name}</div>`
    : `<div style="font-size: 50px; margin: 10px 0;">🎖️</div><div style="font-weight: bold; color: #b026ff;">Participant</div>`;

  overlay.innerHTML = `
    <style>
      @media print {
        body * { visibility: hidden; }
        #certificate-content, #certificate-content * { visibility: visible; }
        #certificate-content { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        .cert-controls { display: none !important; }
      }
      .cert-container {
        background: #fff; color: #1a1a1a;
        width: 100%; max-width: 800px;
        padding: 40px; border-radius: 15px;
        position: relative; overflow: hidden;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,240,255,0.2);
        border: 10px solid #0b0f19;
      }
      .cert-container::before {
        content: ''; position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px;
        border: 2px solid #b026ff; pointer-events: none;
      }
      .cert-header { font-family: 'Space Grotesk', sans-serif; font-size: 40px; font-weight: 800; color: #0b0f19; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 3px; }
      .cert-sub { font-size: 18px; color: #666; margin-bottom: 40px; text-transform: uppercase; letter-spacing: 2px; }
      .cert-name { font-family: 'Space Grotesk', sans-serif; font-size: 48px; font-weight: 700; color: #00f0ff; -webkit-text-stroke: 1px #0b0f19; margin: 20px 0; border-bottom: 2px solid #ddd; display: inline-block; padding: 0 40px 10px; }
      .cert-body { font-size: 20px; line-height: 1.6; margin-bottom: 40px; }
      .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; text-align: left; font-size: 14px; }
      .cert-sig { border-top: 1px solid #333; padding-top: 10px; width: 200px; text-align: center; font-weight: bold; }
    </style>
    
    <div class="cert-controls" style="display: flex; gap: 20px; margin-bottom: 20px;">
      <button id="btn-print" class="btn" style="background: var(--neon-blue); color: #000;">Print / Save PDF</button>
      <button id="btn-close-cert" class="btn btn-secondary" style="background: rgba(0,0,0,0.5);">Close</button>
    </div>
    
    <div id="certificate-content" class="cert-container">
      <div class="cert-header">Certificate of Achievement</div>
      <div class="cert-sub">AI & Robotics • Class 8 • ${state.student.schoolName}</div>
      
      <div class="cert-body">
        This is to certify that
        <br>
        <div class="cert-name">${state.student.name}</div>
        <br>
        Roll Number: ${state.student.rollNumber}
        <br>
        has successfully completed the AI & Robotics Assessment with a score of
        <strong>${state.finalStats.correct} / 60</strong> (${state.finalStats.accuracy}%)
      </div>
      
      ${badgeHTML}
      
      <div class="cert-footer">
        <div>
          <strong>Certificate ID:</strong> ${certId}<br>
          <strong>Date:</strong> ${date}
        </div>
        <div class="cert-sig">
          AI Evaluation System
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  document.getElementById('btn-print').addEventListener('click', () => {
    window.print();
  });
  
  document.getElementById('btn-close-cert').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
}
