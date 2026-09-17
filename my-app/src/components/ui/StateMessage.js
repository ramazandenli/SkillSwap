/**
 * Yukleniyor / hata / bos liste durumlari.
 *
 * Bu uc durum her veri ceken panelde ayni sekilde tekrar ediyor. Tek bilesende
 * toplayinca paneller sadece "veri var mi" sorusuyla ilgileniyor.
 */
export function Loading({ label = "Yukleniyor..." }) {
  return (
    <p className="state state--loading" role="status">
      <span className="state__spinner" aria-hidden="true" />
      {label}
    </p>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <p className="state state--error" role="alert">
      {message}
      {onRetry && (
        <button type="button" className="btn btn--ghost btn--sm" onClick={onRetry}>
          Tekrar dene
        </button>
      )}
    </p>
  );
}

export function Empty({ children }) {
  return <p className="state state--empty">{children}</p>;
}

/**
 * useAsyncData'nin ciktisini dogrudan alip dogru durumu gosteren sarmalayici.
 * Panellerdeki "if (loading) ... if (error) ..." merdivenini kaldiriyor.
 */
export function AsyncBoundary({ loading, error, onRetry, children }) {
  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={onRetry} />;
  return children;
}
