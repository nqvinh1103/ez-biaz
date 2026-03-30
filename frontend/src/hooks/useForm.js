import { useCallback, useState } from "react";

/**
 * Generic controlled-form hook that handles `name`-based onChange events.
 *
 * @param {Record<string, string>} initialValues
 * @returns {{ values, handleChange, reset, setValues }}
 *
 * @example
 * const { values, handleChange } = useForm({ name: "", email: "" });
 * <input name="name" value={values.name} onChange={handleChange} />
 */
export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const reset = useCallback(() => setValues(initialValues), [initialValues]);

  return { values, handleChange, reset, setValues };
}
