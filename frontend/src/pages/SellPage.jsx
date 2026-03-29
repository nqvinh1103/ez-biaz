import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import ItemTypeSelector from "../components/sell/ItemTypeSelector";
import PhotoUploader from "../components/sell/PhotoUploader";
import BackLink from "../components/ui/BackLink";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { useAuth } from "../hooks/useAuth";
import { useFileUpload } from "../hooks/useFileUpload";
import { useForm } from "../hooks/useForm";
import { createListing } from "../lib/ezbiasApi";

const CONDITIONS = ["Brand New", "Like New", "Good", "Fair", "Poor"];

const INITIAL_FORM = {
  name: "",
  description: "",
  condition: "",
  price: "",
  stock: "1",
  fandom: "",
};

const TagIcon = () => (
  <svg
    className="h-4 w-4 text-[#ad93e6]"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3ZM6 6h.008v.008H6V6Z"
    />
  </svg>
);

function SellPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { values, handleChange, reset } = useForm(INITIAL_FORM);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const upload = useFileUpload(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleTypesChange = useCallback((updated) => {
    setSelectedTypes(updated);
  }, []);

  const isValid =
    upload.previews.length > 0 &&
    values.name.trim() &&
    values.condition &&
    values.price &&
    Number(values.stock) >= 1 &&
    values.fandom.trim() &&
    selectedTypes.length > 0;

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);
    const res = await createListing(
      user?.id ?? "u1",
      {
        name: values.name,
        description: values.description,
        condition: values.condition,
        price: values.price,
        stock: Number(values.stock),
        fandom: values.fandom,
        itemTypes: selectedTypes,
      },
      upload.files,
    );
    setSubmitting(false);
    if (res.success) {
      navigate("/my-listings");
    } else {
      setError(res.message);
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-170 px-4 py-10 md:py-14">
        <BackLink to="/fandoms" label="Back to Shop" />

        {/* Page title */}
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ad93e6]">
            <TagIcon />
          </span>
          <h1 className="text-2xl font-bold text-[#121212]">
            List an Item for Sale
          </h1>
        </div>

        {/* ── Product Photos ─────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-[#121212]">
            Product Photos
          </h2>
          <PhotoUploader
            previews={upload.previews}
            isDragging={upload.isDragging}
            inputRef={upload.inputRef}
            maxFiles={5}
            onAddFiles={upload.addFiles}
            onRemove={upload.removeFile}
            onOpenPicker={upload.openPicker}
            dragHandlers={upload.dragHandlers}
          />
        </section>

        {/* ── Product Details ────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-[#121212]">
            Product Details
          </h2>

          <FormField
            label="Product Name"
            id="sell-name"
            name="name"
            placeholder="e.g. BTS Army Bomb Ver.4"
            value={values.name}
            onChange={handleChange}
            wrapperClassName="mb-4"
          />

          <FormField
            label="Description"
            id="sell-desc"
            as="textarea"
            name="description"
            placeholder="Describe your item — include details like inclusions, defects, etc."
            rows={4}
            value={values.description}
            onChange={handleChange}
            wrapperClassName="mb-4"
          />

          <div className="flex flex-col gap-4 md:flex-row">
            {/* Condition */}
            <div className="relative flex-1">
              <FormField
                label="Condition"
                id="sell-condition"
                as="select"
                name="condition"
                value={values.condition}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select condition
                </option>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </FormField>
              {/* Custom chevron */}
              <svg
                className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 text-[#737373]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19 9-7 7-7-7"
                />
              </svg>
            </div>

            {/* Stock */}
            <div className="relative flex-1">
              <FormField
                label="Stock"
                id="sell-stock"
                name="stock"
                type="number"
                min="1"
                step="1"
                placeholder="1"
                value={values.stock}
                onChange={handleChange}
              />
            </div>

            {/* Price */}
            <div className="relative flex-1">
              <FormField
                label="Price"
                id="sell-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={values.price}
                onChange={handleChange}
                className="pr-12"
              />
              <span className="absolute bottom-3 right-3 text-sm text-[#737373]">
                VNĐ
              </span>
            </div>
          </div>
        </section>

        {/* ── Tags & Categories ──────────────────────────────────── */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <TagIcon />
            <h2 className="text-sm font-semibold text-[#121212]">
              Tags &amp; Categories
            </h2>
          </div>

          <FormField
            label="Fandom / Group"
            id="sell-fandom"
            name="fandom"
            placeholder="Search fandom…"
            value={values.fandom}
            onChange={handleChange}
            wrapperClassName="mb-4"
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#737373]">
              Item Type
            </span>
            <ItemTypeSelector
              selected={selectedTypes}
              onChange={handleTypesChange}
            />
          </div>
        </section>

        {/* ── Submit ────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2">
          {error && <p className="w-full text-sm text-[#ef4343]">{error}</p>}
          <Button
            size="lg"
            disabled={!isValid || submitting}
            className="w-full"
            type="button"
            onClick={handleSubmit}
          >
            {submitting ? "Posting…" : "Post Listing"}
          </Button>
          {!isValid && !error && (
            <p className="text-xs text-[#737373]">
              Add at least one photo, fill in name, condition, price, fandom,
              and item type.
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default SellPage;
