import { PageIntro, pageMeta } from "@/components/hive/Primitives";
import { CopyButton, ContactComposer } from "@/components/hive/Interactions";
import { contactEmail } from "@/content/contact";
import { profile } from "@/content/hive";
export const metadata = pageMeta(
  "Contact",
  "Get in touch with Arinze Okigbo. Email, LinkedIn, GitHub, and writing.",
  "/contact",
);
export default function Contact() {
  return (
    <div className="contact-page">
      <PageIntro
        label="A GOOD PLACE TO START"
        title="Say something."
        description="A project, a question, an idea that won’t leave you alone. My inbox is the simplest way to reach me."
      />
      <section className="shell">
        <a className="contact-email" href={`mailto:${contactEmail}`}>
          {contactEmail}
          <span>↗</span>
        </a>
        <div className="contact-controls">
          <CopyButton value={contactEmail} />
          <p>Or select the address and take it with you.</p>
        </div>
        <ContactComposer email={contactEmail} />
        <div className="contact-links">
          {profile.links
            .filter((l) => l.label !== "Email")
            .map((l) => (
              <a key={l.label} href={l.url} target="_blank" rel="noreferrer">
                {l.label}
                <span>↗</span>
              </a>
            ))}
        </div>
      </section>
    </div>
  );
}
