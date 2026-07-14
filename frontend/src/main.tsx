import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ProgrammeView } from './pages/ProgrammeView';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

// Section 6.1: "Works from a cold link, with no login and no training." No router is
// specified in the doc's stack (section 2.3), so this scaffold renders the programme view
// directly; routing between programmes/payments is an implementation-phase concern.
createRoot(container).render(
  <StrictMode>
    <ProgrammeView programmeId="demo-programme" />
  </StrictMode>,
);
