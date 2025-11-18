import clsx from "classnames"
import "../styles/checkbox.css"

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: React.ReactNode
}

const Checkbox = ({ label, className, ...props }: CheckboxProps) => (
  <label className={clsx("checkbox-label", className)}>
    <input type="checkbox" className="checkbox-input" {...props} />
    <div className={clsx("checkbox-box", props.checked && "checked")}>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2.94446 5.76604L4.8928 8.04165L8.3889 3.95831"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    {label}
  </label>
)

export default Checkbox
