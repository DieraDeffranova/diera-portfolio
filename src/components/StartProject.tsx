import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useStartProject } from '../context/StartProjectContext';
import { useDialog } from '../hooks/useDialog';
import { budgetIds, deadlineIds, needIds, type BudgetId, type DeadlineId, type NeedId } from '../data/services';
import { en } from '../i18n/locales/en';
import { fmt, useI18n } from '../i18n';
import { profile } from '../data/profile';
import { Wordmark } from './Navbar';
import { cn } from '../lib/cn';
import { EASE } from '../lib/motion';

interface FormData {
  needs: NeedId[];
  description: string;
  deadline: DeadlineId | '';
  budget: BudgetId | '';
  name: string;
  email: string;
  contact: string;
}

const EMPTY: FormData = { needs: [], description: '', deadline: '', budget: '', name: '', email: '', contact: '' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const STEP_COUNT = 5;
type Status = 'form' | 'sending' | 'sent' | 'error';
type ErrorKey = 'needs' | 'description' | 'deadline' | 'budget' | 'name' | 'email';
type Errors = Partial<Record<ErrorKey, true>>;

/** Returns which fields are invalid; the messages come from the active locale. */
function validate(step: number, d: FormData): Errors {
  const e: Errors = {};
  if (step === 0 && d.needs.length === 0) e.needs = true;
  if (step === 1 && d.description.trim().length < 20) e.description = true;
  if (step === 2 && !d.deadline) e.deadline = true;
  if (step === 3 && !d.budget) e.budget = true;
  if (step === 4) {
    if (!d.name.trim()) e.name = true;
    if (!EMAIL.test(d.email.trim())) e.email = true;
  }
  return e;
}

function Option({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'min-h-11 rounded-full border px-5 py-2.5 text-[15px] transition-colors duration-500 ease-soft sm:px-6',
        selected ? 'border-sand-100 bg-sand-100 text-ink-950' : 'border-sand/25 text-sand-200 hover:border-sand/70',
      )}
    >
      {label}
    </button>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} role={message ? 'alert' : undefined} className="mt-4 min-h-[1.25rem] text-sm text-champagne">
      {message}
    </p>
  );
}

export default function StartProject() {
  const { isOpen, preset, closeRequest } = useStartProject();
  const { t } = useI18n();
  const steps = t.form.steps;
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('form');
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useDialog(isOpen, closeRequest, closeRef);

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setErrors({});
    setStatus('form');
    setData({ ...EMPTY, needs: preset ? [preset] : [] });
  }, [isOpen, preset]);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleNeed = (n: NeedId) =>
    update('needs', data.needs.includes(n) ? data.needs.filter((x) => x !== n) : [...data.needs, n]);

  const goTo = (s: number) => {
    setStep(s);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const send = async () => {
    setStatus('sending');
    // Options are sent in English so requests read the same whatever language the visitor used.
    const payload = {
      services: data.needs.map((n) => en.form.needs[n]),
      description: data.description.trim(),
      deadline: data.deadline ? en.form.deadlines[data.deadline] : '',
      budget: data.budget ? en.form.budgets[data.budget] : '',
      language: document.documentElement.lang,
      name: data.name.trim(),
      email: data.email.trim(),
      contact: data.contact.trim(),
    };
    try {
      if (profile.formEndpoint) {
        const res = await fetch(profile.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      } else {
        await new Promise((r) => setTimeout(r, 1100));
      }
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const next = (e?: FormEvent) => {
    e?.preventDefault();
    const found = validate(step, data);
    setErrors(found);
    if (Object.keys(found).length) return;
    if (step < STEP_COUNT - 1) goTo(step + 1);
    else void send();
  };

  const mailtoFallback = `mailto:${profile.email}?subject=${encodeURIComponent('Project request')}&body=${encodeURIComponent(
    `Services: ${data.needs.map((n) => en.form.needs[n]).join(', ')}\nDeadline: ${data.deadline ? en.form.deadlines[data.deadline] : ''}\nBudget: ${data.budget ? en.form.budgets[data.budget] : ''}\n\n${data.description}\n\n${data.name}\n${data.email}\n${data.contact}`,
  )}`;

  const inputCls =
    'w-full border-b border-sand/25 bg-transparent py-4 text-lg font-light text-sand-100 placeholder:text-sand/30 transition-colors focus:border-sand-100 focus:outline-none';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="start-project"
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-title"
          className="fixed inset-0 z-[60] bg-ink-950"
          initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          transition={{ duration: 0.85, ease: EASE }}
        >
          <div ref={scrollRef} className="h-full overflow-y-auto pt-[env(safe-area-inset-top)]">
            <div className="container-x flex h-20 items-center justify-between lg:h-24">
              <div className="flex items-center gap-6">
                <Wordmark className="text-sand-100" />
                <span className="label hidden sm:inline">{t.form.title}</span>
              </div>
              <div className="flex items-center gap-6">
                {status === 'form' || status === 'sending' ? (
                  <span className="text-[12px] tracking-[0.24em] text-sand/60" aria-live="polite">
                    0{step + 1} / 0{STEP_COUNT}
                  </span>
                ) : null}
                <button
                  ref={closeRef}
                  type="button"
                  onClick={closeRequest}
                  aria-label={t.form.close}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-sand/30 transition-colors hover:border-sand-100"
                >
                  <X size={18} strokeWidth={1.2} />
                </button>
              </div>
            </div>

            <div className="h-px bg-sand/10">
              <motion.div
                className="h-px origin-left bg-sand-200"
                initial={false}
                animate={{ scaleX: status === 'sent' ? 1 : (step + 1) / STEP_COUNT }}
                transition={{ duration: 0.8, ease: EASE }}
              />
            </div>

            <div className="container-x pb-[calc(4rem+env(safe-area-inset-bottom))] pt-14 lg:pt-24">
              <div className="mx-auto max-w-4xl">
                <AnimatePresence mode="wait">
                  {status === 'sent' ? (
                    <motion.div
                      key="sent"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.9, ease: EASE }}
                      className="py-10"
                    >
                      <p className="label">{fmt(t.form.sentEyebrow, { name: data.name.trim().split(' ')[0] })}</p>
                      <h2 id="request-title" className="mt-8 font-serif text-[clamp(2.75rem,7vw,6rem)] font-light uppercase leading-[0.95] text-sand-100">
                        {t.form.sentTitle}
                      </h2>
                      <p className="mt-8 max-w-[40ch] text-lg text-sand/70">{t.form.sentText}</p>
                      <button
                        type="button"
                        onClick={closeRequest}
                        className="group mt-14 inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.22em] text-sand-200"
                      >
                        <span className="link-underline">{t.form.backToSite}</span>
                        <ArrowRight size={15} strokeWidth={1.2} className="transition-transform duration-500 group-hover:translate-x-1" />
                      </button>
                    </motion.div>
                  ) : status === 'error' ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.9, ease: EASE }}
                      className="py-10"
                    >
                      <p className="label">{t.form.errorEyebrow}</p>
                      <h2 id="request-title" className="mt-8 font-serif text-[clamp(2.25rem,5vw,4.5rem)] font-light leading-[1.02] text-sand-100">
                        {t.form.errorTitle}
                      </h2>
                      <p className="mt-6 max-w-[48ch] text-sand/70">
                        {t.form.errorText}
                      </p>
                      <div className="mt-12 flex flex-wrap items-center gap-8">
                        <button
                          type="button"
                          onClick={() => void send()}
                          className="border border-sand/30 px-7 py-4 text-[12px] uppercase tracking-[0.22em] transition-colors hover:border-sand-100 hover:bg-sand-100 hover:text-ink-950"
                        >
                          {t.form.tryAgain}
                        </button>
                        {profile.email ? (
                          <a href={mailtoFallback} className="link-underline text-[12px] uppercase tracking-[0.22em]">
                            {t.form.sendByEmail}
                          </a>
                        ) : (
                          <a
                            href={profile.upwork}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-underline text-[12px] uppercase tracking-[0.22em]"
                          >
                            {t.form.messageUpwork}
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key={`step-${step}`}
                      onSubmit={next}
                      noValidate
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.55, ease: EASE }}
                    >
                      <p className="label">{steps[step].eyebrow}</p>
                      <h2 id="request-title" className="mt-6 font-serif text-[clamp(2.25rem,5.4vw,4.75rem)] font-light leading-[1.02] text-sand-100">
                        {steps[step].title}
                      </h2>

                      <div className="mt-12 lg:mt-16">
                        {step === 0 && (
                          <fieldset aria-describedby="err-needs">
                            <legend className="sr-only">{t.form.needsLegend}</legend>
                            <p className="mb-6 text-sm text-sand/50">{t.form.chooseMore}</p>
                            <div className="flex flex-wrap gap-2.5 sm:gap-3">
                              {needIds.map((n) => (
                                <Option key={n} label={t.form.needs[n]} selected={data.needs.includes(n)} onClick={() => toggleNeed(n)} />
                              ))}
                            </div>
                            <FieldError id="err-needs" message={errors.needs && t.form.errors.needs} />
                          </fieldset>
                        )}

                        {step === 1 && (
                          <div>
                            <label htmlFor="req-description" className="sr-only">
                              {t.form.descriptionLabel}
                            </label>
                            <textarea
                              id="req-description"
                              autoFocus
                              rows={6}
                              value={data.description}
                              onChange={(e) => update('description', e.target.value)}
                              aria-invalid={!!errors.description}
                              aria-describedby="err-description"
                              placeholder={t.form.descriptionPlaceholder}
                              className={cn(inputCls, 'resize-none leading-relaxed')}
                            />
                            <div className="flex items-start justify-between gap-6">
                              <FieldError id="err-description" message={errors.description && t.form.errors.description} />
                              <span className="mt-4 shrink-0 text-xs tabular-nums text-sand/40">
                                {fmt(t.form.characters, { n: data.description.trim().length })}
                              </span>
                            </div>
                          </div>
                        )}

                        {step === 2 && (
                          <fieldset aria-describedby="err-deadline">
                            <legend className="sr-only">{t.form.deadlineLegend}</legend>
                            <div className="flex flex-wrap gap-2.5 sm:gap-3">
                              {deadlineIds.map((d) => (
                                <Option key={d} label={t.form.deadlines[d]} selected={data.deadline === d} onClick={() => update('deadline', d)} />
                              ))}
                            </div>
                            <FieldError id="err-deadline" message={errors.deadline && t.form.errors.deadline} />
                          </fieldset>
                        )}

                        {step === 3 && (
                          <fieldset aria-describedby="err-budget">
                            <legend className="sr-only">{t.form.budgetLegend}</legend>
                            <div className="flex flex-wrap gap-2.5 sm:gap-3">
                              {budgetIds.map((b) => (
                                <Option key={b} label={t.form.budgets[b]} selected={data.budget === b} onClick={() => update('budget', b)} />
                              ))}
                            </div>
                            <FieldError id="err-budget" message={errors.budget && t.form.errors.budget} />
                          </fieldset>
                        )}

                        {step === 4 && (
                          <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
                            <div>
                              <label htmlFor="req-name" className="label">
                                {t.form.name}
                              </label>
                              <input
                                id="req-name"
                                autoFocus
                                autoComplete="name"
                                value={data.name}
                                onChange={(e) => update('name', e.target.value)}
                                aria-invalid={!!errors.name}
                                aria-describedby="err-name"
                                placeholder={t.form.namePlaceholder}
                                className={inputCls}
                              />
                              <FieldError id="err-name" message={errors.name && t.form.errors.name} />
                            </div>
                            <div>
                              <label htmlFor="req-email" className="label">
                                {t.form.email}
                              </label>
                              <input
                                id="req-email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => update('email', e.target.value)}
                                aria-invalid={!!errors.email}
                                aria-describedby="err-email"
                                placeholder={t.form.emailPlaceholder}
                                className={inputCls}
                              />
                              <FieldError id="err-email" message={errors.email && t.form.errors.email} />
                            </div>
                            <div className="sm:col-span-2">
                              <label htmlFor="req-contact" className="label">
                                {t.form.contact}
                              </label>
                              <input
                                id="req-contact"
                                autoComplete="tel"
                                value={data.contact}
                                onChange={(e) => update('contact', e.target.value)}
                                placeholder={t.form.contactPlaceholder}
                                className={inputCls}
                              />
                            </div>
                            <dl className="mt-8 grid gap-4 border-t border-sand/10 pt-8 text-sm sm:col-span-2 sm:grid-cols-3">
                              <div>
                                <dt className="label">{t.form.summaryServices}</dt>
                                <dd className="mt-2 text-sand-200">{data.needs.map((n) => t.form.needs[n]).join(', ')}</dd>
                              </div>
                              <div>
                                <dt className="label">{t.form.summaryTimeline}</dt>
                                <dd className="mt-2 text-sand-200">{data.deadline && t.form.deadlines[data.deadline]}</dd>
                              </div>
                              <div>
                                <dt className="label">{t.form.summaryBudget}</dt>
                                <dd className="mt-2 text-sand-200">{data.budget && t.form.budgets[data.budget]}</dd>
                              </div>
                            </dl>
                          </div>
                        )}
                      </div>

                      <div className="mt-12 flex flex-col-reverse gap-3 border-t border-sand/10 pt-8 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                        {step > 0 ? (
                          <button
                            type="button"
                            onClick={() => goTo(step - 1)}
                            className="group inline-flex min-h-11 items-center gap-3 py-3 text-[12px] uppercase tracking-[0.22em] text-sand/70 hover:text-sand-100"
                          >
                            <ArrowLeft size={15} strokeWidth={1.2} className="transition-transform duration-500 group-hover:-translate-x-1" />
                            {t.form.back}
                          </button>
                        ) : (
                          <span className="hidden sm:block" />
                        )}
                        <button
                          type="submit"
                          disabled={status === 'sending'}
                          className="group inline-flex w-full items-center justify-center gap-3 border border-sand/30 px-6 py-4 text-[12px] uppercase tracking-[0.22em] text-sand-100 transition-colors duration-500 hover:border-sand-100 hover:bg-sand-100 hover:text-ink-950 disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:px-8"
                        >
                          {step === STEP_COUNT - 1 ? (status === 'sending' ? t.form.sending : t.form.send) : t.form.continue}
                          <ArrowRight size={15} strokeWidth={1.2} className="transition-transform duration-500 group-hover:translate-x-1" />
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
