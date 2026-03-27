import { useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { useForm } from "../hooks/useForm";
import { sendContactMessage } from "../lib/ezbiasApi";

const INITIAL_FORM = { name: "", email: "", message: "" };

function ContactPage() {
  const { values, handleChange, reset } = useForm(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const res = await sendContactMessage(values.name, values.email, values.message);

    setSubmitting(false);
    if (res.success) {
      setSuccess(res.message ?? "Message sent!");
      reset();
    } else {
      setError(res.message ?? "Failed to send message.");
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[560px] px-4 py-10 md:py-16">
        {/* Heading */}
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#121212] md:text-3xl">
            Contact Us
          </h1>
          <p className="text-sm text-[#737373]">
            Have a question? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-5"
          noValidate
        >
          <FormField
            label="Name"
            id="contact-name"
            name="name"
            placeholder="Your name"
            value={values.name}
            onChange={handleChange}
          />
          <FormField
            label="Email"
            id="contact-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={handleChange}
          />
          <FormField
            label="Message"
            id="contact-message"
            as="textarea"
            name="message"
            placeholder="How can we help?"
            rows={5}
            value={values.message}
            onChange={handleChange}
          />

          {error && (
            <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#ef4343]">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
              {success}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Sending…" : "Send Message"}
          </Button>
        </form>
      </div>
    </PageLayout>
  );
}

export default ContactPage;
