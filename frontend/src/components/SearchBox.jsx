export default function SearchBox({ value, onChange, onSearch, isLoading }) {
  return (
    <form
      className="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search stop"
        aria-label="Search stop"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
