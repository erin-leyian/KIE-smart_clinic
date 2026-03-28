// Mock component for Calendar as there is no specific visual for an overall calendar (only My Availability)
export default function Calendar() {
  return (
    <div className="card">
      <h2 className="card-title">Calendar View</h2>
      <p className="text-muted">A full-page calendar component could be rendered here to show all appointments across the month.</p>
    </div>
  );
}
