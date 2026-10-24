import DashboardView from '../components/DashboardView'

export default function OwnerDashboardPage() {
  return (
    <DashboardView
      endpoint="/owner/dashboard"
      eyebrow="Owner workspace"
      title="Overview"
      subtitle="Occupancy, rent and complaints across your properties."
      propertyBase="/owner/properties"
    />
  )
}
