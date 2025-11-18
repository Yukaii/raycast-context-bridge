import "../styles/field.css"

type FieldProps = {
  label?: string
  children: React.ReactNode
  name?: string
}

export const Field = ({ label, name, children }: FieldProps) => (
  <>
    {label ? (
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
    ) : null}
    <div className="field-outer">
      <div className="field-inner">
        {children}
        <div className="field-glow" />
      </div>
    </div>
  </>
)
