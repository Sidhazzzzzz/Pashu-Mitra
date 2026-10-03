const fs = require('fs'); let code = fs.readFileSync('client/src/pages/dashboard/dashboard.css', 'utf8'); code = code.replace('.coop-topbar {
  height: 64px;
  border-bottom: 1px solid var(--coop-border);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 32px;
  background: var(--coop-card-bg);
  gap: 24px;
}', '.coop-topbar {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 32px;
  gap: 24px;
  background: transparent;
}'); fs.writeFileSync('client/src/pages/dashboard/dashboard.css', code);
