/**
 * Sayfadaki her kutu ayni cerceveyi paylasiyor: baslik, istege bagli sag ust
 * aksiyon ve govde. Kutu gorunumunu tek bir bilesende toplayinca hem stil
 * tekrari bitiyor hem de yeni bir bolum eklemek tek satira dusuyor.
 */
function Panel({ title, actions, children, className = "" }) {
  return (
    <section className={`panel ${className}`.trim()}>
      {(title || actions) && (
        <header className="panel__header">
          {title && <h2 className="panel__title">{title}</h2>}
          {actions && <div className="panel__actions">{actions}</div>}
        </header>
      )}
      <div className="panel__body">{children}</div>
    </section>
  );
}

export default Panel;
