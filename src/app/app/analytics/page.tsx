import { ClickAnalyticsChart } from "@/components/dashboard/analytics-charts";

export const metadata = {
  title: "Analytics",
};

export default function AnalyticsPage() {
  return (
    <>
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Simple click tracking for every short link in the workspace.
        </p>
      </section>
      <ClickAnalyticsChart />
    </>
  );
}
