const projectOptions = [
  "A new or redesigned website",
  "A custom business tool or portal",
  "Google Ads",
  "Facebook or Instagram Ads",
  "Website and advertising",
  "Website care or improvements",
  "I am not sure yet",
  "Something else",
];

export default function PrototypeContactForm({ styles }) {
  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <div className={styles.fieldWide}>
        <label htmlFor={`${styles.form}-name`}>
          Your name <span>Required</span>
        </label>
        <input id={`${styles.form}-name`} name="fullName" autoComplete="name" />
      </div>

      <fieldset className={styles.contactFields}>
        <legend>
          How should I contact you? <span>At least one required</span>
        </legend>
        <div>
          <label htmlFor={`${styles.form}-email`}>Email</label>
          <input
            id={`${styles.form}-email`}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor={`${styles.form}-phone`}>Phone</label>
          <input
            id={`${styles.form}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(225) 555-0123"
          />
        </div>
      </fieldset>

      <div className={styles.fieldPair}>
        <div>
          <label htmlFor={`${styles.form}-business`}>
            Business name <span>Optional</span>
          </label>
          <input
            id={`${styles.form}-business`}
            name="company"
            autoComplete="organization"
          />
        </div>
        <div>
          <label htmlFor={`${styles.form}-website`}>
            Current website <span>Optional</span>
          </label>
          <input
            id={`${styles.form}-website`}
            name="website"
            type="url"
            autoComplete="url"
            placeholder="https://"
          />
        </div>
      </div>

      <div className={styles.fieldWide}>
        <label htmlFor={`${styles.form}-type`}>
          What would you like help with? <span>Required</span>
        </label>
        <select id={`${styles.form}-type`} name="projectType" defaultValue="">
          <option value="" disabled>
            Choose one
          </option>
          {projectOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className={styles.fieldWide}>
        <label htmlFor={`${styles.form}-message`}>
          What are you hoping to improve? <span>Required</span>
        </label>
        <textarea
          id={`${styles.form}-message`}
          name="message"
          rows="5"
          placeholder="A sentence or two is enough. You can describe the problem even if you do not know the solution."
        />
      </div>

      <button type="submit">Send message</button>
      <p className={styles.privacy}>
        I use your information only to respond to this request.
      </p>
    </form>
  );
}
