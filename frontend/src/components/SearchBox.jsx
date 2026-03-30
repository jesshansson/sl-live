export default function SearchBox({ value, onChange, onSearch, isLoading }) {
  return (
    <form
      className="searchBar"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search stop or station"
        aria-label="Search stop or station"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}