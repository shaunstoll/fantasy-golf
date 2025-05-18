import Header from "@/components/header";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 p-1 size-full">
      <Header />
      {children}
    </div>
  );
}
