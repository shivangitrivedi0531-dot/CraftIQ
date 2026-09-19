import MetricCard from "../MetricCard";

export default function LocalMarketCard({ value }) {
  return (
    <MetricCard
      label="Local Market Average Price"
      value={`₹${value}`}
      unit="per unit"
      icon="💰"
      bgColor="bg-yellow-50"
      borderColor="border-yellow-200"
      trend={5}
    />
  );
}