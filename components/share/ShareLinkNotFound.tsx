export default function ShareLinkNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-xl font-bold">This link is no longer active</h1>
        <a href="/store" className="text-[#27BA5F] mt-2 inline-block">Browse all stores →</a>
      </div>
    </div>
  );
}
