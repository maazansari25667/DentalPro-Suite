export default async function AppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Appointment Details</h1>
      <p>Appointment ID: {id}</p>
    </div>
  );
}
