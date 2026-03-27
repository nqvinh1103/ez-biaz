import { Link } from "react-router-dom";
import ProductCard from "../cards/ProductCard";

function TrendingSection({ products }) {
  return (
    <section
      className="px-4 md:px-6 lg:px-24 xl:px-65"
      aria-labelledby="trending-title"
    >
      <div className="mx-auto flex w-full max-w-350 flex-col gap-6 px-2 py-8 sm:px-4 md:gap-8 md:py-16">
        <div className="flex items-center justify-between">
          <h2
            className="text-xl font-bold text-[#121212] md:text-2xl xl:text-[30px]"
            id="trending-title"
          >
            Trending Now
          </h2>
          <Link
            to="/fandoms"
            className="flex items-center gap-1 text-sm font-semibold text-[#ad93e6]"
          >
            View All
            <img
              src="https://www.figma.com/api/mcp/asset/848cbe91-fa3a-4f7e-bfd1-fd84a13d21be"
              alt=""
              aria-hidden="true"
              className="h-4 w-4"
            />
          </Link>
        </div>

        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="list"
        >
          {products.map((product) => (
            <ProductCard
              key={`${product.artist}-${product.name}`}
              {...product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrendingSection;
