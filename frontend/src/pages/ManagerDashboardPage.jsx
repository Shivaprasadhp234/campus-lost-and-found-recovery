import DashboardView from '../components/DashboardView'

export default function ManagerDashboardPage() {
  return (
    <DashboardView
      endpoint="/manager/dashboard"
      eyebrow="Manager workspace"
      title="Overview"
      subtitle="Occupancy, rent and complaints for your properties."
      propertyBase="/manager/properties"
    />
  )
}
