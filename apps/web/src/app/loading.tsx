export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        padding: 'var(--space-6)',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div
        className="skeleton"
        style={{ height: '40px', width: '300px', borderRadius: 'var(--radius-md)' }}
      />
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)' }}
      >
        <div className="skeleton" style={{ height: '160px', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ height: '160px', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ height: '160px', borderRadius: 'var(--radius-lg)' }} />
      </div>
      <div
        className="skeleton"
        style={{ height: '400px', width: '100%', borderRadius: 'var(--radius-xl)' }}
      />
    </div>
  )
}
