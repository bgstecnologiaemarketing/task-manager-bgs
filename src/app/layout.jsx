export const metadata = {
  title: "Task Manager — BGS Automation",
  description: "Gerenciamento de tarefas integrado ao ClickUp",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, background: "#F7F6F2" }}>
        {children}
      </body>
    </html>
  );
}
