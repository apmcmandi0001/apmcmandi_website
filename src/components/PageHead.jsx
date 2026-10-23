export default function PageHead({ title, intro }) {
  return (
    <div className="page-head">
      <div className="wrap">
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
    </div>
  )
}
