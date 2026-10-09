import { newSessionId, getOrCreateSessionId } from '../useChatEngine';

const FORMAT = /^chat-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('chat session ids', () => {
  beforeEach(() => localStorage.clear());

  it('are random v4 UUIDs, never repeated', () => {
    const ids = new Set(Array.from({ length: 50 }, newSessionId));
    expect(ids.size).toBe(50);
    ids.forEach((id) => expect(id).toMatch(FORMAT));
  });

  it('replaces a guessable id saved by an older version', () => {
    localStorage.setItem('uia-chat-session-id', 'chat-k3j2h1-ab12cd');
    const id = getOrCreateSessionId();
    expect(id).toMatch(FORMAT);
    expect(localStorage.getItem('uia-chat-session-id')).toBe(id);
  });

  it('keeps a valid saved id', () => {
    const saved = newSessionId();
    localStorage.setItem('uia-chat-session-id', saved);
    expect(getOrCreateSessionId()).toBe(saved);
  });
});
