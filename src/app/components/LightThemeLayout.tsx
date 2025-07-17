export default function LightThemeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {children}
    </div>
  );
}