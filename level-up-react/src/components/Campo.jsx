function Campo({ id, label, sugerencia, error, ...props }) {
  return (
    <div className="campo-formulario">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} className={error ? 'input-error' : ''} {...props} />
      {sugerencia && <small className="sugerencia">{sugerencia}</small>}
      <span className="error">{error}</span>
    </div>
  )
}

export default Campo