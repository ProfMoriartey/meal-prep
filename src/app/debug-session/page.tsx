// Create this file: src/app/debug-session/page.tsx
import { auth } from "~/server/auth";

export default async function DebugSessionPage() {
  try {
    const session = await auth();

    return (
      <div className="p-8">
        <h1 className="mb-4 text-2xl font-bold">Session Debug</h1>
        {session ? (
          <div>
            <h2 className="text-lg font-semibold text-green-600">
              ✅ Session Found
            </h2>
            <pre className="mt-4 overflow-auto rounded bg-gray-100 p-4">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-red-600">
              ❌ No Session
            </h2>
            <p>User is not authenticated</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="mb-4 text-2xl font-bold">Session Debug</h1>
        <h2 className="text-lg font-semibold text-red-600">❌ Error</h2>
        <pre className="mt-4 overflow-auto rounded bg-red-100 p-4">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}
