/** Tailwind class groups for Home — keep screen markup readable while scanning in Tailwind. */
export const homeTw = {
  screen: 'flex-1 bg-void',
  safe: 'flex-1',
  scroll: 'flex-1',
  scrollContent: 'px-base pt-sm gap-base',
  header: 'flex-row justify-between items-center py-sm',
  greeting: 'text-h1 font-bold text-ink-primary',
  headerSubtitle: 'text-body text-ink-secondary mt-0.5',
  avatarButton:
    'w-11 h-11 rounded-full overflow-hidden items-center justify-center border border-glass-border',
  avatarEmoji: 'text-2xl',
  heroCard: 'relative p-xl min-h-[160px]',
  rippleContainer: 'absolute inset-0 items-center justify-center',
  heroTextBlock: 'gap-sm',
  heroLabel: 'text-label-sm text-accent-secondary',
  heroText: 'text-h2 text-ink-primary leading-8',
  heroDate: 'text-caption text-ink-tertiary',
  moodCard: 'flex-col p-base gap-md',
  sectionLabel: 'text-label text-ink-secondary',
  moodSetLabel: 'text-caption text-accent-secondary',
  moodRow: 'flex-row justify-between py-sm',
  quickLaunchRow: 'flex-row items-center justify-between w-full gap-sm',
  quickLaunchText: 'flex-1 gap-1',
  quickLaunchTitle: 'text-h3 text-ink-primary',
  quickLaunchSubtitle:
    'text-body-sm text-ink-primary font-semibold opacity-90 [text-shadow-color:rgba(0,0,0,0.35)] [text-shadow-offset:0px_1px] [text-shadow-radius:2px]',
  quickLaunchArrowBreathe:
    'w-10 h-10 rounded-full bg-[rgba(96,165,250,0.25)] items-center justify-center',
  quickLaunchArrowJournal:
    'w-10 h-10 rounded-full bg-[rgba(244,114,182,0.25)] items-center justify-center',
  quickLaunchArrowIcon: 'text-xl text-orb-blue',
  quickLaunchArrowIconJournal: 'text-xl text-orb-rose',
  scrollFooter: 'h-[100px]',
} as const;
