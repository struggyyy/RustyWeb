import CustomCursor from "@/components/common/CustomCursor";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CustomCursor variant="precise" />
      {children}
    </>
  );
}
