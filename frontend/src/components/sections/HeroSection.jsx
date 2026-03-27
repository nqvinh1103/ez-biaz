function HeroSection() {
  return (
    <section
      className="relative overflow-hidden px-0 md:px-6 lg:px-24 xl:px-65"
      aria-label="Hero"
    >
      <img
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        src="background.jpg"
        alt="K-pop merchandise background"
      />
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[rgba(173,147,230,0.1)] blur-3xl"
        aria-hidden="true"
      ></div>
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-[rgba(173,147,230,0.05)] blur-3xl"
        aria-hidden="true"
      ></div>

      <div className="relative mx-auto flex w-full max-w-350 flex-col items-center gap-6 px-4 py-15 md:py-20 xl:py-32">
        <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(147,183,230,0.73)] px-4 py-1.5">
          <img
            className="h-3.5 w-3.5"
            src="https://www.figma.com/api/mcp/asset/9dcc5db7-76ae-4b7e-95bc-b37df4b3946a"
            alt=""
            aria-hidden="true"
          />
          <span className="whitespace-nowrap text-xs font-semibold text-[#9d73f9]">
            Your #1 K-pop Merch Destination
          </span>
        </div>

        <h1 className="max-w-4xl text-center text-[32px] font-extrabold leading-9.5 tracking-[-1.2px] text-[#121212] md:text-[42px] md:leading-12 xl:text-[60px] xl:leading-15 xl:tracking-[-1.5px]">
          Discover and Collect Your
          <br className="hidden sm:block" />
          Favorite <span className="text-[#ad93e6]">K-pop</span> Merch
        </h1>

        <p className="max-w-2xl text-center text-sm leading-5.5 text-[#737373] md:text-base md:leading-7 lg:text-lg">
          From lightsticks to limited-edition albums - shop authentic
          <br className="hidden md:block" />
          merchandise from the groups you love.
        </p>

        <div className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row">
          <a
            href="#"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#ad93e6] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#9d7ed9]"
          >
            Shop Now
          </a>
          <a
            href="#"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#ad93e6] bg-white px-8 text-sm font-semibold text-[#ad93e6] transition-colors hover:bg-[#ad93e6] hover:text-white"
          >
            Live Auctions
          </a>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
