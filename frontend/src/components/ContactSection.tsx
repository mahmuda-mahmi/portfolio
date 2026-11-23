import { useState, type FormEvent } from 'react';

interface ContactSectionProps {
  email: string;
  githubUrl: string;
  linkedinUrl: string;
}

export function ContactSection({ email, githubUrl, linkedinUrl }: ContactSectionProps) {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setFeedback('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: senderEmail, message }),
      });
      const json = (await res.json()) as { message?: string | string[] };
      if (!res.ok) {
        const msg = Array.isArray(json.message)
          ? json.message.join(', ')
          : json.message ?? 'Could not send message.';
        setStatus('error');
        setFeedback(msg);
        return;
      }
      setStatus('sent');
      setFeedback(json.message?.toString() ?? 'Message received!');
      setName('');
      setSenderEmail('');
      setMessage('');
    } catch {
      setStatus('error');
      setFeedback('Network error reaching the NestJS API.');
    }
  }

  return (
    <section id="contact" className="contact-section" aria-label="Contact">
      <div>
        <h2 className="say-hi">SAY HI!</h2>
        <button type="button" className="contact-email button-wipe" onClick={handleCopy}>
          <span>▶</span>
          <span>{copied ? 'COPIED TO CLIPBOARD!' : email.toUpperCase()}</span>
        </button>

        <div className="contact-links">
          <a href={githubUrl} target="_blank" rel="noreferrer" className="button-wipe label">
            ↗ GITHUB
          </a>
          <a href={linkedinUrl} target="_blank" rel="noreferrer" className="button-wipe label">
            ↗ LINKEDIN
          </a>
        </div>
      </div>

      <form className="contact-box" onSubmit={handleSubmit}>
        <span className="label" style={{ color: '#bfa8f5' }}>
          ▶ DIRECT MESSAGE (NESTJS 11 API)
        </span>
        <input
          type="text"
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
        />
        <textarea
          rows={3}
          required
          minLength={5}
          placeholder="Tell me about your project or role..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="button-wipe label"
          style={{ alignSelf: 'flex-start' }}
          disabled={status === 'sending'}
        >
          <span>{status === 'sending' ? 'SENDING...' : '▶ SEND MESSAGE'}</span>
        </button>
        {feedback && (
          <p
            className="mono-copy"
            style={{
              margin: 0,
              fontSize: '0.78rem',
              color: status === 'error' ? '#ff8a8a' : '#bfa8f5',
            }}
          >
            {feedback}
          </p>
        )}
      </form>
    </section>
  );
}
