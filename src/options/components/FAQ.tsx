import { ChevronDownIcon } from "@raycast/icons"
import clsx from "classnames"
import { useId, useState } from "react"

type FAQEntry = { q: string; a: string }

const FAQPanel = ({
  title,
  content,
  expanded,
  onToggle
}: {
  title: string
  content: string
  expanded: boolean
  onToggle: () => void
}) => {
  const id = useId()
  return (
    <div className="faq-panel">
      <h4 id={`${id}-title`} className="faq-question">
        <button
          className="faq-trigger"
          aria-expanded={expanded}
          aria-controls={`${id}-content`}
          onClick={onToggle}>
          {title}
        </button>
      </h4>
      <div
        className="faq-answer"
        role="region"
        aria-labelledby={`${id}-title`}
        aria-hidden={!expanded}
        id={`${id}-content`}>
        <div>{content}</div>
      </div>
      <div
        className={clsx("faq-arrow", expanded && "expanded")}
        onClick={onToggle}>
        <ChevronDownIcon className="icon" />
      </div>
    </div>
  )
}

const FAQ = ({ faqs, showTitle = true }: { faqs: FAQEntry[]; showTitle?: boolean }) => {
  const [activeIndex, setActiveIndex] = useState(-1)
  const toggle = (index: number) => setActiveIndex((current) => (current === index ? -1 : index))

  return (
    <div className="faq-wrapper">
      {showTitle ? (
        <>
          <h3>FAQs</h3>
          <p className="faq-subtitle">Answers to the most frequently asked questions.</p>
        </>
      ) : null}
      <div className="faq-accordion">
        {faqs.map((entry, index) => (
          <FAQPanel
            key={entry.q}
            title={entry.q}
            content={entry.a}
            expanded={activeIndex === index}
            onToggle={() => toggle(index)}
          />
        ))}
      </div>
    </div>
  )
}

export default FAQ
