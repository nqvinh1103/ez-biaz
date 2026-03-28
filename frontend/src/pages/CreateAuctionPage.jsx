import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import ItemTypeSelector from "../components/sell/ItemTypeSelector";
import PhotoUploader from "../components/sell/PhotoUploader";
import BackLink from "../components/ui/BackLink";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../hooks/useAuth";
import { useFileUpload } from "../hooks/useFileUpload";
import { useForm } from "../hooks/useForm";
import { createAuction } from "../lib/ezbiasApi";

const CONDITIONS = ["Brand New", "Like New", "Good", "Fair", "Poor"];
const DURATIONS = [
  { value: "1", label: "1 Day" },
  { value: "3", label: "3 Days" },
  { value: "7", label: "7 Days" },
  { value: "14", label: "14 Days" },
];

const INITIAL_FORM = {
  name: "",
  description: "",
  condition: "",
  fandom: "",
  startingBid: "",
  reservePrice: "",
  duration: "",
};

const GavelIcon = () => (
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
      d="M15.042 21.672L13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"
    />
  </svg>
);

const ChevronIcon = () => (
  <svg
    className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 text-[#737373]"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
  </svg>
);

function CreateAuctionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { values, handleChange } = useForm(INITIAL_FORM);
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
    values.fandom.trim() &&
    values.startingBid &&
    values.duration &&
    selectedTypes.length > 0;

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);

    const res = await createAuction(
      user?.id ?? "u1",
      {
        name: values.name,
        description: values.description,
        condition: values.condition,
        fandom: values.fandom,
        startingBid: values.startingBid,
        reservePrice: values.reservePrice || null,
        durationDays: values.duration,
        itemTypes: selectedTypes,
      },
      upload.files,
    );

    setSubmitting(false);
    if (res.success) {
      showToast("Auction listed successfully!", "success");
      navigate("/auction");
    } else {
      setError(res.message || "Failed to create auction. Please try again.");
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-170 px-4 py-10 md:py-14">
        <BackLink to="/auction" label="Back to Auctions" />

        {/* Page title */}
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ad93e6]">
            <GavelIcon />
          </span>
          <h1 className="text-2xl font-bold text-[#121212]">
            Create an Auction
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

        {/* ── Item Details ───────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-[#121212]">
            Item Details
          </h2>

          <FormField
            label="Item Name"
            id="auction-name"
            name="name"
            placeholder="e.g. BTS Map of the Soul Photo Book"
            value={values.name}
            onChange={handleChange}
            wrapperClassName="mb-4"
          />

          <FormField
            label="Description"
            id="auction-desc"
            as="textarea"
            name="description"
            placeholder="Describe your item — include condition details, inclusions, defects, etc."
            rows={4}
            value={values.description}
            onChange={handleChange}
            wrapperClassName="mb-4"
          />

          <div className="flex gap-4">
            {/* Condition */}
            <div className="relative flex-1">
              <FormField
                label="Condition"
                id="auction-condition"
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
              <ChevronIcon />
            </div>

            {/* Fandom */}
            <div className="flex-1">
              <FormField
                label="Fandom / Group"
                id="auction-fandom"
                name="fandom"
                placeholder="e.g. BTS, BLACKPINK…"
                value={values.fandom}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* ── Auction Settings ───────────────────────────────────── */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <GavelIcon />
            <h2 className="text-sm font-semibold text-[#121212]">
              Auction Settings
            </h2>
          </div>

          <div className="flex gap-4 mb-4">
            {/* Starting Bid */}
            <div className="relative flex-1">
              <FormField
                label="Starting Bid"
                id="auction-start"
                name="startingBid"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={values.startingBid}
                onChange={handleChange}
                className="pl-7"
              />
              <span className="absolute bottom-3 left-3 text-sm text-[#737373]">
                $
              </span>
            </div>

            {/* Reserve Price */}
            <div className="relative flex-1">
              <FormField
                label="Reserve Price (optional)"
                id="auction-reserve"
                name="reservePrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={values.reservePrice}
                onChange={handleChange}
                className="pl-7"
              />
              <span className="absolute bottom-3 left-3 text-sm text-[#737373]">
                $
              </span>
            </div>
          </div>

          {/* Duration */}
          <div className="relative">
            <FormField
              label="Auction Duration"
              id="auction-duration"
              as="select"
              name="duration"
              value={values.duration}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select duration
              </option>
              {DURATIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </FormField>
            <ChevronIcon />
          </div>

          {values.reservePrice &&
            values.startingBid &&
            Number(values.reservePrice) < Number(values.startingBid) && (
              <p className="mt-2 text-xs text-amber-600">
                Reserve price is lower than starting bid — it won't have any
                effect.
              </p>
            )}
        </section>

        {/* ── Tags & Item Type ───────────────────────────────────── */}
        <section className="mb-10">
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
            {submitting ? "Creating Auction…" : "Start Auction"}
          </Button>
          {!isValid && !error && (
            <p className="text-xs text-[#737373]">
              Add at least one photo, fill in name, condition, fandom, starting
              bid, duration, and item type.
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default CreateAuctionPage;
