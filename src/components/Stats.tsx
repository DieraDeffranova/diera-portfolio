import { profile } from '../data/profile';
import { useI18n } from '../i18n';
import { cn } from '../lib/cn';

export default function Stats({ className }: { className?: string }) {
  const { t } = useI18n();
  const items = [
    { value: profile.behanceStats.views, label: t.stats.views, sub: t.stats.viewsSub },
    { value: profile.behanceStats.appreciations, label: t.stats.appreciations },
    { value: profile.behanceStats.followers, label: t.stats.followers },
  ];
  return (
    <dl className={cn('grid w-full max-w-[34rem] grid-cols-3', className)} aria-label={t.stats.label}>
      {items.map((s, i) => (
        <div
          key={s.label}
          className={cn('flex min-w-0 flex-col pr-4 sm:pr-10', i > 0 && 'border-l border-sand/15 pl-4 sm:pl-10')}
        >
          <dt className="order-2 mt-3 text-[12px] leading-snug text-sand/60 sm:text-[13px]">
            {s.label}
            {s.sub && (
              <>
                <br />
                {s.sub}
              </>
            )}
          </dt>
          <dd className="order-1 font-serif text-[clamp(1.6rem,3vw,2.5rem)] font-light leading-none text-sand-100">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
