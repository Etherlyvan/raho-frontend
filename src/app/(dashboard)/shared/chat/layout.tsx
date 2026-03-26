export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Layout sederhana — positioning dilakukan di page-level masing-masing
  // agar /chat dan /chat/[roomId] bisa memiliki layout yang berbeda secara fleksibel
  return <>{children}</>
}
