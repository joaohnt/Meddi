import { useMemo, useState } from 'react'
import logo from '../logo.png'

const initialRows = [
  { value: '', frequency: '' },
  { value: '', frequency: '' },
  { value: '', frequency: '' },
]

function calculate(values) {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const center = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 ? sorted[center] : (sorted[center - 1] + sorted[center]) / 2
  const counts = new Map()
  sorted.forEach(value => counts.set(value, (counts.get(value) || 0) + 1))
  const highest = Math.max(...counts.values())
  const modes = highest === 1 ? [] : [...counts].filter(([, count]) => count === highest).map(([value]) => value)
  return { mean, median, modes }
}

function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(value)
}

function Results({ result }) {
  const rows = [
    ['Média aritmética', result ? formatNumber(result.mean) : '—', '÷'],
    ['Mediana', result ? formatNumber(result.median) : '—', '↔'],
    ['Moda', result ? (result.modes.length ? result.modes.map(formatNumber).join(', ') : 'Amodal') : '—', '★'],
  ]
  return <div className="results" aria-live="polite">
    {rows.map(([label, value, icon]) => <div className="result" key={label}>
      <span className="result-icon">{icon}</span>
      <span><small>{label}</small><strong>{value}</strong></span>
    </div>)}
  </div>
}

function RawData() {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const parsed = useMemo(() => input.trim() ? input.trim().split(/[\s,;]+/).map(Number) : [], [input])
  const invalid = parsed.some(value => !Number.isFinite(value))
  const result = !invalid ? calculate(parsed) : null
  function submit(event) {
    event.preventDefault()
    setError(!input.trim() ? 'Digite ao menos um número.' : invalid ? 'Use somente números separados por vírgula, ponto e vírgula ou espaço.' : '')
  }
  return <section id="dados-brutos" className="calculator raw-section">
    <div className="section-heading"><span></span><div><p className="eyebrow">Cálculo simples</p><h2>Dados Brutos</h2><p>Digite os números separados por vírgula, espaço ou em linhas.</p></div><span></span></div>
    <form onSubmit={submit} className="calculator-content">
      <div><textarea value={input} onChange={event => { setInput(event.target.value); setError('') }} placeholder="Ex.: 12, 15, 18, 12, 20, 15, 14, 16, 12, 18" aria-label="Dados brutos" />
      {error && <p className="error">{error}</p>}<button type="submit">Calcular</button></div>
      <Results result={result} />
    </form>
  </section>
}

function FrequencyTable() {
  const [rows, setRows] = useState(initialRows)
  const [error, setError] = useState('')
  const values = useMemo(() => rows.flatMap(row => {
    const value = Number(row.value.replace(',', '.'))
    const frequency = Number(row.frequency)
    return Number.isFinite(value) && Number.isInteger(frequency) && frequency > 0 ? Array(frequency).fill(value) : []
  }), [rows])
  const completeRows = rows.filter(row => row.value !== '' || row.frequency !== '')
  const valid = completeRows.length > 0 && completeRows.every(row => Number.isFinite(Number(row.value.replace(',', '.'))) && Number.isInteger(Number(row.frequency)) && Number(row.frequency) > 0)
  const result = valid ? calculate(values) : null
  function update(index, field, value) { setRows(current => current.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row)); setError('') }
  function submit(event) { event.preventDefault(); setError(valid ? '' : 'Preencha cada linha com um valor numérico e uma frequência inteira maior que zero.') }
  return <section id="tabela-frequencia" className="calculator frequency-section">
    <div className="section-heading"><span></span><div><p className="eyebrow">Dados agrupados</p><h2>Tabela de Frequência</h2><p>Preencha os valores e suas respectivas frequências.</p></div><span></span></div>
    <form onSubmit={submit} className="calculator-content">
      <div><div className="table"><div className="table-header"><b>Valor</b><b>Frequência</b><b></b></div>{rows.map((row, index) => <div className="table-row" key={index}><input inputMode="decimal" value={row.value} onChange={event => update(index, 'value', event.target.value)} placeholder="Ex.: 10" aria-label={`Valor ${index + 1}`} /><input inputMode="numeric" value={row.frequency} onChange={event => update(index, 'frequency', event.target.value)} placeholder="Ex.: 2" aria-label={`Frequência ${index + 1}`} /><button className="remove" type="button" onClick={() => setRows(current => current.length > 1 ? current.filter((_, rowIndex) => rowIndex !== index) : current)} aria-label="Remover linha">×</button></div>)}</div>
      <button className="add-row" type="button" onClick={() => setRows(current => [...current, { value: '', frequency: '' }])}>+ Nova linha</button>{error && <p className="error">{error}</p>}<button type="submit">Calcular</button></div>
      <Results result={result} />
    </form>
  </section>
}

export default function App() {
  return <><header className="hero"><nav><img className="brand" src={logo} alt="MEDICI" /><a href="#dados-brutos">Dados brutos</a><a href="#tabela-frequencia">Tabela de frequência</a></nav><div className="hero-banner"><div className="banner-image"><a className="banner-link raw-link" href="#dados-brutos"><span>Dados brutos</span></a><a className="banner-link table-link" href="#tabela-frequencia"><span>Tabela de frequência</span></a></div></div></header><main><RawData /><div className="frequency-strip"><FrequencyTable /></div></main><footer>Medidas de Posição Central · Estatística</footer></>
}
