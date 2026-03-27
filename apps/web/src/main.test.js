import { jsx as _jsx } from "react/jsx-runtime";
import ReactDOM from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentApp } from './main';
const originalFetch = global.fetch;
beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
});
afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
});
describe('web document shell', () => {
    it('renders bundled document content when the api is unavailable', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('offline'));
        const container = document.getElementById('root');
        ReactDOM.createRoot(container).render(_jsx(DocumentApp, {}));
        await vi.waitFor(() => {
            expect(document.body.textContent).toContain('SuperShip document workspace');
            expect(document.body.textContent).toContain('Program Alpha');
            expect(document.body.textContent).toContain('API unavailable');
        });
    });
    it('creates a local fallback document from the shell action', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('offline'));
        const container = document.getElementById('root');
        ReactDOM.createRoot(container).render(_jsx(DocumentApp, {}));
        await vi.waitFor(() => {
            expect(document.body.textContent).toContain('Create seed document');
        });
        const button = Array.from(document.querySelectorAll('button')).find((element) => element.textContent?.includes('Create seed document'));
        button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await vi.waitFor(() => {
            expect(document.body.textContent).toContain('Seeded document 4');
            expect(document.body.textContent).toContain('Added local fallback document');
        });
    });
});
//# sourceMappingURL=main.test.js.map