import { EmptyState } from "@/components/ui/EmptyState";

export default function LearnPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="screen-title">Learn</h1>

      <div className="card">
        <EmptyState
          icon={
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          }
          title="Learn the Wheel"
          subtitle="Educational content coming soon."
        />
      </div>
    </div>
  );
}
